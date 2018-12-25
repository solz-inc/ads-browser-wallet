import ADS from './ads';
import VaultCrypt from './vaultcrypt';
import KeyBox from './keybox';

const name = ({ value, vault }) => {
  if (vault.keys.find(key => key.name === value)) {
    return `Key named ${value} already exists`;
  }
  return null;
};
const publicKey = ({ value, inputs, vault }) => {
  if (!inputs.secretKey || !inputs.secretKey.value) {
    throw new Error('Provide secretKey to full fil publicKey validation');
  }

  if (!ADS.validateKey(value)) {
    return 'Please provide an valid public key';
  }
  if (KeyBox.getPublicKeyFromSecret(inputs.secretKey.value) !== value) {
    return 'Public and secret key does not match';
  }
  if (vault.keys.find(key => key.publicKey === value)) {
    return 'Given public key already exists in data base';
  }

  return null;
};
const secretKey = ({ value, vault }) => {
  if (!ADS.validateKey(value)) {
    return 'Please provide an valid secret key';
  }
  if (vault.keys.find(key => key.secretKey === value)) {
    return 'Given secret key already exists in data base';
  }
  return null;
};
const password = ({ value, vault }) => {
  if (!VaultCrypt.checkPassword(vault, value)) {
    return 'Invalid password';
  }
  return null;
};

export { name, publicKey, secretKey, password };