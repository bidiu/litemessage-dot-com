import env from './env/environment';
import {
  pushBlocks, switchBranch
} from './common/state/blockchain/index';

const types = ['ready', 'push', 'switch'];

// you can reopen a litenode from `DESTROYED` state
const STATES = Object.freeze({
  INIT: 0,      // underlying litenode is just created
  READY: 1,     // underlying litenode is ready (blockchain is initialized)
  DESTROYED: 2, // underlying litenode is destroyed (you can create again)
});

/**
 * When the state in Redux store is not in sync with the
 * blockchain data stored in IndexedDB somehow (such as
 * falling behind by many blocks), it will fetch 20% of 
 * the length of blockchain the Redux store current has.
 */
const SYNC_RATIO = 0.2;

/**
 * When the blockchain in Redux is super long, this one
 * confine the sync lenght in a reasonable range.
 */
const MAX_SYNC_LEN = 200;

/**
 * For each page, retrieve 20 blocks
 */
const PAGE_SIZE = 20;

/**
 * This class is a bridge between blockchain data
 * stored in IndexedDB and the blockchain state
 * stored in Redux store.
 * 
 * The state in Redux store won't be persisted. During
 * app initialization, the state will be created based
 * on data stored in IndexedDB. Later on, they will be
 * kept in sync.
 */
class BlockchainManager {
  constructor(LitemessageWorker, store) {
    this.workerMessageHandler = this.workerMessageHandler.bind(this);
    
    this.LitemessageWorker = LitemessageWorker;
    this.store = store;
    this.timers = [];

    this.createNewWorker();
  }

  /**
   * At one time, there MUST only be one worker.
   * This function will close the running worker
   * automatically before it starts a new one.
   */
  createNewWorker() {
    if (this.state !== STATES.DESTROYED) {
      this.close();
    }
    this.state = STATES.INIT;

    this.worker = this.LitemessageWorker();
    this.worker.addEventListener('message', this.workerMessageHandler);
    // create the underlying node and join into network
    this.worker.createNode('litemessage', env.initPeerUrls);
  }

  /**
   * When we think somehow the redux store is not in sync with
   * the blockchain in IndexedDB (for any possible reason), call
   * this method to sync them.
   */
  async syncBlockchain() {
    let len = Math.round( this.store.getState()
      .blockchain.chain.length * SYNC_RATIO );
    len = Math.max(PAGE_SIZE, Math.min(MAX_SYNC_LEN, len));

    let blocks = await this.worker.getSubBlockchain(undefined, len);
    let head = this.store.getState().blockchain.head;

    if (blocks.length && blocks.slice(-1)[0] !== head) {
      if (head) {
        this.store.dispatch(switchBranch(blocks));
      } else {
        this.store.dispatch(pushBlocks(blocks));
      }
    }
  }

  workerMessageHandler({ data: { type, ...message } }) {
    if (!types.includes(type)) { return; }
    // call the type's handler
    this[`${type}MessageHandler`](message);
  }

  async readyMessageHandler() {
    this.state = STATES.READY;
    this.syncBlockchain(); 
  }

  pushMessageHandler({ block, prevHead }) {
    let head = this.store.getState().blockchain.head;

    if (prevHead === head) {
      this.store.dispatch(pushBlocks([block]));
    } else {
      this.syncBlockchain();
    }
  }

  switchMessageHandler({ blocks, prevHead }) {
    let head = this.store.getState().blockchain.head;

    if (prevHead === head) {
      this.store.dispatch(switchBranch(blocks));
    } else {
      this.syncBlockchain();
    }
  }

  close() {
    if (this.timers) {
      this.timers.forEach(timer => clearInterval(timer));
      this.timers = [];
    }
    if (this.worker) {
      this.worker.removeEventListener('message', this.workerMessageHandler);
      this.worker.terminate();
      this.worker = null;
    }
    this.state = STATES.DESTROYED;
  }
}

export default BlockchainManager;