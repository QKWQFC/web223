import 'package:near_api_flutter/near_api_flutter.dart';

String userAccount = 'YOUR_ACCOUNT_ID'; // testing
Account connectedAccount = Account(
    accountId: userAccount,
    keyPair: KeyStore.newKeyPair(),
    provider: NEARTestNetRPCProvider()); // testing
bool isAccountLogined = false; // testing

String ticketString = "";
