# smart-contracts

Minteeble solidity Smart Contracts library

## How to publish/deploy and verify a contract

N.B. before starting please be sure to correctly set variables in `.env` file.

### 1. Publish/deploy contract

Run:

```sh
$   thirdweb deploy
```

or

```sh
$   thirdweb publish
```

During contract deployment thirdweb will ask you for constructor arguments.
Write them also in `arguments.js` file:

```js
module.exports = ["TokenName", "SYM", 0, 10000, 5, "CID"];
```

They will be used during verification on etherscan.

### 2. verify contract

In order to verify contract run

in testnet:

```sh
$   yarn verify-testnet <CONTRACT_ADDRESS>
```

in mainnet:

```sh
$   yarn verify-mainnet <CONTRACT_ADDRESS>
```
