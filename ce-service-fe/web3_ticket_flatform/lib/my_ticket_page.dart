import 'package:flutter/material.dart';

import 'dart:convert';
import 'package:web3_ticket_flatform/near_tester.dart';
import 'package:web3_ticket_flatform/my_ticket_list.dart';
import 'package:web3_ticket_flatform/data/datas.dart';

import 'package:near_api_flutter/near_api_flutter.dart' as napi;
import 'package:web3_ticket_flatform/data/account.dart';

class MyTicketPage extends StatefulWidget {
  const MyTicketPage({Key? key}) : super(key: key);

  @override
  State<MyTicketPage> createState() => _MyTicketPageState();
}

class _MyTicketPageState extends State<MyTicketPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Container(
        alignment: Alignment.center,
        child: Column(
          children: [
            ElevatedButton(
              onPressed: () async {
                await getMyTicketList();
                final stringJson = listUpTickets();
                setState(() {
                  ticketString = stringJson;
                });
              },
              child: const Text('show my ticket'),
            ),
            const SizedBox(height: 30),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: SingleChildScrollView(
                child: MyTicketList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  getMyTicketList() async {
    const method = viewMethod;
    String methodArgs =
        '{"account_id": "${connectedAccount.accountId}", "limit": 5}';

    napi.Contract contract = napi.Contract(contractId, connectedAccount);
    myTicketResponse =
        await NEARTester.callViewMethod(contract, method, methodArgs);
  }

  String listUpTickets() {
    if (myTicketResponse.isNotEmpty &&
        myTicketResponse.containsKey('result') &&
        myTicketResponse['result'].containsKey('result')) {
      return utf8.decode(myTicketResponse['result']['result'].cast<int>());
    } else {
      return nullTicket;
    }
  }
}
