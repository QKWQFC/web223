import 'package:near_api_flutter/near_api_flutter.dart';

String userAccount = 'min49590.testnet'; // testing
Account connectedAccount = Account(
    accountId: userAccount,
    keyPair: KeyStore.newKeyPair(),
    provider: NEARTestNetRPCProvider()); // testing
bool isAccountLogined = false; // testing

String ticketString = '';
