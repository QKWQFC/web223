
# NFT Contract
## Contract struct
```rust
pub struct Contract {
    //contract owner
    pub owner_id: AccountId,

    //approved minters
    pub approved_minters: LookupSet<AccountId>,

    //approved users that can create series
    pub approved_creators: LookupSet<AccountId>,

    //Map the collection ID (stored in Token obj) to the collection data
    pub series_by_id: UnorderedMap<SeriesId, Series>,

    //keeps track of the token struct for a given token ID
    pub tokens_by_id: UnorderedMap<TokenId, Token>,

    //keeps track of all the token IDs for a given account
    pub tokens_per_owner: LookupMap<AccountId, UnorderedSet<TokenId>>,

    //keeps track of the metadata for the contract
    pub metadata: LazyOption<NFTContractMetadata>,
}
```
---
## [1] Call Functions
```rust
// creates a new series
pub fn create_series(
    &mut self,
    id: U64,
    metadata: TokenMetadata,
    royalty: Option<HashMap<AccountId, u32>>,
    price: Option<U128>,
);

// mint a new NFT
pub fn nft_mint(&mut self, id: U64, token_id: String, receiver_id: AccountId);

// add a specified account as an approved minter
pub fn add_approved_minter(&mut self, account_id: AccountId);

// removed a specified account as an approved minter
pub fn remove_approved_minter(&mut self, account_id: AccountId);

// add a specified account as an approved creator
pub fn add_approved_creator(&mut self, account_id: AccountId);

// removed a specified account as an approved creator
pub fn remove_approved_creator(&mut self, account_id: AccountId);

// transfer an NFT to a receiver
fn nft_transfer(
    &mut self,
    receiver_id: AccountId,
    token_id: TokenId,
    approval_id: Option<u64>,
    memo: Option<String>,
);

// transfer an NFT to a receiver and calls a function on the receiver's contract
fn nft_transfer_call(
    &mut self,
    receiver_id: AccountId,
    token_id: TokenId,
    approval_id: Option<u64>,
    memo: Option<String>,
    msg: String,
) -> PromiseOrValue<bool>;

// approve an account to transfer the token
fn nft_approve(&mut self, token_id: TokenId, account_id: AccountId, msg: Option<String>);

// revoke an account from transferring the token
fn nft_revoke(&mut self, token_id: TokenId, account_id: AccountId);

// revoke all account from transferring the token
fn nft_revoke_all(&mut self, token_id: TokenId);
```

---

## [2] View Functions
```rust
// check if the passed in account has access to approve the token ID
fn nft_is_approved(
    &self,
    token_id: TokenId,
    approved_account_id: AccountId,
    approval_id: Option<u64>,
) -> bool;

// query for the total supply of NFTs on the contract
fn nft_total_supply(&self) -> U128;

// query for nft tokens on the contract regardless of the owner using pagination
fn nft_tokens(&self, from_index: Option<U128>, limit: Option<u64>) -> Vec<JsonToken>;

// get the total supply of NFTs for a given owner
fn nft_supply_for_owner(&self, account_id: AccountId) -> U128;

// query for all the tokens for an owner
pub fn nft_tokens_for_owner(
    &self,
    account_id: AccountId,
    from_index: Option<U128>,
    limit: Option<u64>,
) -> Vec<JsonToken>;

// get the total supply of series on the contract
pub fn get_series_total_supply(&self) -> u64;

// paginate through all the series on the contract and return the a vector of JsonSeries
pub fn get_series(&self, from_index: Option<U128>, limit: Option<u64>) -> Vec<JsonSeries>;

// get info for a specific series
pub fn get_series_details(&self, id: u64) -> Option<JsonSeries>;

// get the total supply of NFTs on a current series
pub fn nft_supply_for_series(&self, id: u64) -> U128;

// paginate through NFTs within a given series
pub fn nft_tokens_for_series(
    &self,
    id: u64,
    from_index: Option<U128>,
    limit: Option<u64>,
) -> Vec<JsonToken>;

// view call for returning the contract metadata
fn nft_metadata(&self) -> NFTContractMetadata;

// get the information for a specific token ID
fn nft_token(&self, token_id: TokenId) -> Option<JsonToken>;

/// check if a specified account is an approved minter
fn is_approved_minter(&self, account_id: AccountId) -> bool;

/// check if a specified account is an approved creator
fn is_approved_creator(&self, account_id: AccountId) -> bool;

// calculates the payout for a token given the passed in balance. This is a view method
fn nft_payout(&self, token_id: TokenId, balance: U128, max_len_payout: u32) -> Payout;

// transfers the token to the receiver ID and returns the payout object that should be payed given the passed in balance.
fn nft_transfer_payout(
    &mut self,
    receiver_id: AccountId,
    token_id: TokenId,
    approval_id: u64,
    memo: Option<String>,
    balance: U128,
    max_len_payout: u32,
) -> Payout;

```
