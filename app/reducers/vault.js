import * as actions from '../actions/vault';
import KeyBox from '../utils/keybox';
import VaultCrypt from '../utils/vaultcrypt';
import BgClient from '../../app/utils/background';
import {
  InvalidPasswordError,
  AccountsLimitError,
  UnknownPublicKeyError,
  ItemNotFound,
} from '../actions/errors';
import config from '../config';

const initialVault = {
  empty: true,
  sealed: true,
  secret: '',
  seedPhrase: '',
  seed: '',
  keys: [],
  importedKeys: [],
  accounts: [],
  selectedAccount: null,
};

const actionsMap = {

  [actions.VAULT_CREATE](vault, action) {
    console.debug('CREATE_VAULT');
    BgClient.startSession(window.btoa(action.password));
    const seed = KeyBox.seedPhraseToHex(action.seedPhrase);

    const newVault = {
      ...initialVault,
      ...vault,
      empty: false,
      sealed: false,
      seedPhrase: action.seedPhrase,
      seed,
      keys: KeyBox.generateKeys(seed, config.initKeysQuantity),
      keyCount: config.initKeysQuantity,
    };
    newVault.secret = VaultCrypt.save(newVault, action.password, action.callback);

    return newVault;
  },

  [actions.VAULT_EREASE]() {
    console.debug('EREASE_VAULT');
    //TODO check password
    BgClient.removeSession();
    VaultCrypt.erase();
    return initialVault;
  },

  [actions.VAULT_UNSEAL](vault, action) {
    console.debug('UNSEAL_VAULT');
    if (!VaultCrypt.checkPassword(vault, action.password)) {
      throw new InvalidPasswordError();
    }

    BgClient.startSession(window.btoa(action.password));
    const unsealedVault = VaultCrypt.decrypt(vault, action.password);

    return {
      ...initialVault,
      ...vault,
      ...unsealedVault,
      sealed: false,
    };
  },

  [actions.VAULT_SEAL](vault) {
    console.debug('SEAL_VAULT');
    BgClient.removeSession();
    return {
      ...initialVault,
      secret: vault.secret,
      empty: vault.empty,
      sealed: true,
    };
  },

  [actions.VAULT_ADD_ACCOUNT](vault, action) {
    console.debug('ADD_ACCOUNT');
    if (!VaultCrypt.checkPassword(vault, action.password)) {
      throw new InvalidPasswordError();
    }
    if (vault.accounts.length >= config.accountsLimit) {
      throw new AccountsLimitError(config.accountsLimit);
    }

    const address = action.address.toUpperCase();
    const name = action.name;
    const publicKey = action.publicKey.toUpperCase();
    const key = vault.keys.find(k => k.publicKey === publicKey);

    if (!key) {
      throw new UnknownPublicKeyError(action.publicKey);
    }

    const updatedVault = {
      ...initialVault,
      ...vault,
    };
    updatedVault.accounts.push({
      address,
      name,
      publicKey,
      secretKey: key.secretKey,
    });
    updatedVault.secret = VaultCrypt.save(updatedVault, action.password, action.callback);

    return updatedVault;
  },

  [actions.VAULT_UPDATE_ACCOUNT](vault, action) {
    console.debug('UPDATE_ACCOUNT');
    if (!VaultCrypt.checkPassword(vault, action.password)) {
      throw new InvalidPasswordError();
    }

    const address = action.address.toUpperCase();
    const name = action.name;
    const publicKey = action.publicKey.toUpperCase();
    const key = vault.keys.find(k => k.publicKey === publicKey);

    if (!key) {
      throw new UnknownPublicKeyError(action.publicKey);
    }

    const account = vault.accounts.find(a => a.address === address);
    if (!account) {
      throw new ItemNotFound('account', action.address);
    }

    account.name = name;
    account.publicKey = publicKey;
    account.secretKey = key.secretKey;

    const updatedVault = {
      ...initialVault,
      ...vault,
    };
    updatedVault.secret = VaultCrypt.save(updatedVault, action.password, action.callback);

    return updatedVault;
  },

  [actions.VAULT_REMOVE_ACCOUNT](vault, action) {
    console.debug('REMOVE_ACCOUNT');
    if (!VaultCrypt.checkPassword(vault, action.password)) {
      throw new InvalidPasswordError();
    }

    const address = action.address.toUpperCase();
    const account = vault.accounts.find(a => a.address === address);
    if (!account) {
      throw new ItemNotFound('account', action.address);
    }

    const updatedVault = {
      ...initialVault,
      ...vault,
    };
    updatedVault.accounts = vault.accounts.filter(a => a.address !== address);
    updatedVault.secret = VaultCrypt.save(updatedVault, action.password, action.callback);

    return updatedVault;
  },

  [actions.VAULT_IMPORT_KEY](vault, action) {
    console.debug('IMPORT_KEY');
    if (!VaultCrypt.checkPassword(vault, action.password)) {
      throw new InvalidPasswordError();
    }

    const updatedVault = { ...vault };
    updatedVault.keys.push({
      name: action.name,
      secretKey: action.secretKey,
      publicKey: action.publicKey,
    });

    updatedVault.secret = VaultCrypt.encrypt(updatedVault, action.password);
    VaultCrypt.save(updatedVault, action.callback);

    return updatedVault;
  },
};

export default function (vault = initialVault, action) {
  const reduceFn = actionsMap[action.type];
  if (!reduceFn) return vault;
  return reduceFn(vault, action);
}
