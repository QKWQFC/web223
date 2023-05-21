# Market Contract
## Contract struct
```rust
pub struct Contract {
    pub owner_id: AccountId,

    pub sales: UnorderedMap<ContractAndTokenId, Sale>,

    pub by_owner_id: LookupMap<AccountId, UnorderedSet<ContractAndTokenId>>,

    pub by_nft_contract_id: LookupMap<AccountId, UnorderedSet<TokenId>>,

    pub storage_deposits: LookupMap<AccountId, Balance>,
}
```
--- 
## [1] Call Functions
```rust
// allows users to deposit storage within the marketplace contract storage.
pub fn storage_deposit(&mut self, account_id: Option<AccountId>);

// allows users to withdraw any excess storage that they're not using.
pub fn storage_withdraw(&mut self);

// removes a sale from the market.
pub fn remove_sale(&mut self, nft_contract_id: AccountId, token_id: String);

// updates the price for a sale on the market
pub fn update_price(&mut self, nft_contract_id: AccountId, token_id: String, price: U128);

// place an offer on a specific sale.
pub fn offer(&mut self, nft_contract_id: AccountId, token_id: String);
```

---

## [2] View Functions
```rust
// return the minimum storage for 1 sale
pub fn storage_minimum_balance(&self) -> U128;

// return how much storage an account has paid for
pub fn storage_balance_of(&self, account_id: AccountId) -> U128;

// returns the number of sales the marketplace has up (as a string)
pub fn get_supply_sales(&self) -> U64;

// returns the number of sales for a given account (result is a string)
pub fn get_supply_by_owner_id(&self, account_id: AccountId) -> U64;

// returns paginated sale objects for a given account. (result is a vector of sales)
pub fn get_sales_by_owner_id(
    &self,
    account_id: AccountId,
    from_index: Option<U128>,
    limit: Option<u64>,
) -> Vec<Sale>;

// get the number of sales for an nft contract. (returns a string)
pub fn get_supply_by_nft_contract_id(&self, nft_contract_id: AccountId) -> U64;

// returns paginated sale objects associated with a given nft contract.
pub fn get_sales_by_nft_contract_id(
    &self,
    nft_contract_id: AccountId,
    from_index: Option<U128>,
    limit: Option<u64>,
) -> Vec<Sale>;

// get a sale information for a given unique sale ID (contract + DELIMITER + token ID)
pub fn get_sale(&self, nft_contract_token: ContractAndTokenId) -> Option<Sale>;
```
