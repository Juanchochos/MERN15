import 'package:flutter/material.dart';
import 'main.dart';

class CustomDrawer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: <Widget>[
          const DrawerHeader(
            decoration: BoxDecoration(
              color: black,
              ),
            child: Text('DOMINOES', style: TextStyle(color: white)),
          ),
          ListTile(
            leading: const Icon(Icons.home),
            title: const Text('Home'),
            onTap: () {
              //setState(() {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                  builder: (context) => const HomePage(),
                  ),
                );
              //});
            },
          ),
          ListTile(
            leading: const Icon(Icons.question_mark),
            title: const Text('Help'),
            onTap: () {
              Navigator.pop(context);
              showDialog(
                context: context,
                builder: (BuildContext context) {
                  return AlertDialog(
                    title: const Text('How to Play', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold),),
                    content: const SingleChildScrollView(
                      child: ListBody(
                        children: <Widget>[
                          const Divider(height: 0, thickness: 2.5, color: green2),
                          const SizedBox(height: 20),
                          const Text('To start the game, the player with the highest double will start. \n'
                            'On your turn, you must play a domino that matches the number of dots on one of the open dominos on the board. \n'
                            'You win the game by being the first person to get rid of all their dominos. \n', textAlign: TextAlign.center),
                            const Text('Classic \n', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20), textAlign: TextAlign.center,),
                            const Text('You may only play one domino per turn.\n' 
                            'When a player can\'t play dominoes, they must draw a domino and pass their turn. \n'
                            'If no dominoes available, they just pass.\n' 
                            'There a a total of 28 dominoes when playing 6\'s so count the dominoes to help against your opponent!', textAlign: TextAlign.center),
                        ]
                      )
                    ),
                    actions: [
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                        style: TextButton.styleFrom(
                          foregroundColor: black,
                          backgroundColor: green2,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
                          minimumSize: const Size.fromHeight(50)
                        ),
                        child: const Text('Close', 
                        style: TextStyle(fontWeight: FontWeight.bold,)),
                      ),
                    ],
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0), side: BorderSide(color: green2, width: 2.5)),
                    titleTextStyle: TextStyle(
                      color: green2,
                      fontSize: 24,
                      //fontWeight: FontWeight.bold,
                    ),
                    contentTextStyle: TextStyle(
                      color: white,
                      fontSize: 16,
                    ),
                    backgroundColor: black,
                  );
                }
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.star_rounded),
            title: const Text('History'),
            onTap: () {
              Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const MatchHistoryPage(),
                            ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.logout_rounded),
            title: const Text('Logout'),
            onTap: () {
              Navigator.of(context).pushReplacement(
                  MaterialPageRoute(
                      builder: (_) => MyApp(),
                  ),
                );
            },
          ),
        ],
      ),
    );
  }
}
