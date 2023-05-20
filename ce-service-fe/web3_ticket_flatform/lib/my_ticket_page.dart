import 'package:flutter/material.dart';

import 'dart:convert';
import 'package:web3_ticket_flatform/near_tester.dart';
import 'package:web3_ticket_flatform/my_ticket_list.dart';
import 'package:web3_ticket_flatform/data/datas.dart';

import 'package:web3_ticket_flatform/data/account.dart';
import 'package:near_api_flutter/near_api_flutter.dart' as napi;

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
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: () async {
                await getMyTicketList();
                ticketString = listUpTickets();
                setState(() {});
              },
              child: const Text('show my ticket'),
            ),
            const SizedBox(height: 30),
            Container(
              color: Colors.white,
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: SingleChildScrollView(
                  child: MyTicketList(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  getMyTicketList() async {
    const method = viewMethod;
    String methodArgs = '{"account_id": "min49590.testnet", "limit": 5}';

    napi.Contract contract = napi.Contract(contractId, connectedAccount);
    myTicketResponse =
        await NEARTester.callViewMethod(contract, method, methodArgs);
  }

  String listUpTickets() {
    if (myTicketResponse.isNotEmpty) {
      return utf8.decode(myTicketResponse['result']['result'].cast<int>());
    } else {
      return nullTicket;
    }
  }
}
