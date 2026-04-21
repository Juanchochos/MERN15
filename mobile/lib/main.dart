import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:google_fonts/google_fonts.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'dart:convert';
import 'drawer.dart';
import 'package:boardgame_io/boardgame.dart' as bgio;
//import 'package:provider/provider.dart';
//import 'package:socket_io_client/socket_io_client.dart' as IO;

const Color black = Color.fromARGB(255, 14, 7, 2);
const Color white = Color.fromARGB(255, 240, 223, 211);
const Color beige = Color.fromARGB(255, 207, 172, 148);
const Color green = Color.fromARGB(255, 37, 149, 6);
const Color green2 = Color.fromARGB(255, 57, 201, 34);

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  @override
  Widget build(BuildContext context) {
    return AppBar(
      centerTitle: true,
      leading: Builder(
        builder: (context) => IconButton(
          icon: Image.asset("assets/images/domino.png"),
          onPressed: () {
            Scaffold.of(context).openDrawer();
          },
        ),
      ),
      title: const Text('DOMINOES', style: TextStyle(color: white)),
      backgroundColor: black,
    );
  }
  
  @override
  Size get preferredSize => Size.fromHeight(kToolbarHeight);
}

class Player {
  final String userId;
  final String firstName;
  final String lastName;
  bool isHost = false;
  var playerCredentials;

  Player({
    required this.userId,
    required this.firstName,
    required this.lastName,
  });

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      userId: json['userId'],
      firstName: json['firstName'],
      lastName: json['lastName'],
    );
  }
}

Player player = Player(userId: '', firstName: '', lastName: '');

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
     return MaterialApp(
      title: 'Dominoes',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: black),
        primaryColor: black,
        scaffoldBackgroundColor: black,
        textSelectionTheme: TextSelectionThemeData(
          selectionColor: green.withValues(alpha: 0.5),
          selectionHandleColor: green,
        ),
        primaryTextTheme: TextTheme(
          headlineLarge: TextStyle(
            color: white,
            fontSize: 32,
            fontWeight: FontWeight.bold,
          ),
          bodyMedium: TextStyle(color: white, fontSize: 16),
          bodyLarge: TextStyle(
            color: white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        textTheme: GoogleFonts.exoTextTheme(Theme.of(context).textTheme),
        //colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
        useMaterial3: true,
      ),
      home: const LoginPage(),
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});
  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _loginController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String _errorMessage = '';
  bool _isLoading = false;
  String accessToken = '';
  Future<void> _login() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });
    try {
      final response = await http.post(
        Uri.parse('http://rickymetral.xyz:5000/api/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'login': _loginController.text,
          'password': _passwordController.text,
        }),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        Map<String, dynamic> decoded = JwtDecoder.decode(data['accessToken']);
        player = Player.fromJson(decoded);
        //print("Player ID: ${player.userId}, First Name: ${player.firstName}, Last Name: ${player.lastName}");

        if (data['error'] == null || data['error'].isEmpty) {
          // Login successful, navigate to home page
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => HomePage(
                ),
              ),
            );
          }
        } else {
          setState(() {
            _errorMessage = data['error'];
          });
        }
      } else {
        setState(() {
          _errorMessage = 'Login failed. Please try again.';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Network error. Please check your connection.';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final ButtonStyle style = ElevatedButton.styleFrom(
      textStyle: const TextStyle(fontSize: 20),
      backgroundColor: green,
      padding: const EdgeInsets.symmetric(vertical: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
    );
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        leading: IconButton(
          onPressed: () {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const LoginPage()),
            );
          },
          icon: Image.asset("assets/images/domino.png"),
        ),
        title: const Text('DOMINOES', style: TextStyle(color: white)),
        backgroundColor: black,
      ),
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage("assets/images/woodBG.jpg"),
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  color: black,
                  child: Text(
                    'LOG IN',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const Divider(height: 5, thickness: 5, color: green),
                Container(
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage("assets/images/WoodGrain.jpg"),
                      fit: BoxFit.fill,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 20),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: TextButton(
                            // remove const to allow for navigation
                            onPressed: () {
                              Navigator.pushReplacement(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const SignupPage(),
                                ),
                              );
                            },
                            child: Text.rich(
                              const TextSpan(
                                text: "Don’t have an account? ",
                                children: [
                                  TextSpan(
                                    text: "Sign Up",
                                    style: TextStyle(
                                      color: green,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              style: Theme.of(context).textTheme.bodyMedium!
                                  .copyWith(
                                    color: Theme.of(context)
                                        .textTheme
                                        .bodyLarge!
                                        .color!
                                        .withValues(alpha: 0.8),
                                  ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),
                        TextField(
                          controller: _loginController,
                          decoration: InputDecoration(
                            labelText: 'Username',
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.black),
                            ),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Password',
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.black),
                            ),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _login,
                          style: style,
                          child: _isLoading
                              ? const CircularProgressIndicator()
                              : const Text(
                                  'Login',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                        const SizedBox(height: 16),
                        if (_errorMessage.isNotEmpty)
                          Text(
                            _errorMessage,
                            style: const TextStyle(
                              color: Colors.red,
                              fontSize: 14,
                            ),
                            textAlign: TextAlign.center,
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _loginController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}

class SignupPage extends StatefulWidget {
  const SignupPage({super.key});
  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _loginController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String _errorMessage = '';
  bool _isLoading = false;
  Future<void> _login() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });
    try {
      final response = await http.post(
        Uri.parse('http://rickymetral.xyz:5000/api/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'login': _loginController.text,
          'password': _passwordController.text,
          'firstName': _firstNameController.text,
          'lastName': _lastNameController.text,
          'email': _emailController.text,
        }),
      );
      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        if (data['error'] == null || data['error'].isEmpty) {
          // Signup successful, navigate to home page
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => HomePage(
                  //userId: data['id'],
                  //firstName: data['firstName'],
                  //lastName: data['lastName'],
                ),
              ),
            );
          }
        } else {
          setState(() {
            _errorMessage = data['error'];
          });
        }
      } else {
        setState(() {
          _errorMessage = 'Signup failed. Please try again.';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Network error. Please check your connection.';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  @override
  Widget build(BuildContext context) {
    final ButtonStyle style = ElevatedButton.styleFrom(
      textStyle: const TextStyle(fontSize: 20),
      backgroundColor: green,
      padding: const EdgeInsets.symmetric(vertical: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
    );
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        leading: IconButton(
          onPressed: () {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const LoginPage()),
            );
          },
          icon: Image.asset("assets/images/domino.png"),
        ),
        title: const Text('DOMINOES', style: TextStyle(color: white)),
        backgroundColor: black,
      ),
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage("assets/images/woodBG.jpg"),
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  color: black,
                  child: Text(
                    'SIGN UP',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const Divider(height: 5, thickness: 5, color: green),
                Container(
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage("assets/images/WoodGrain.jpg"),
                      fit: BoxFit.fill,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 20),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: TextButton(
                            // remove const to allow for navigation
                            onPressed: () {
                              Navigator.pushReplacement(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const LoginPage(),
                                ),
                              );
                            },
                            child: Text.rich(
                              const TextSpan(
                                text: "Already have an account? ",
                                children: [
                                  TextSpan(
                                    text: "Sign In",
                                    style: TextStyle(
                                      color: green,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              style: Theme.of(context).textTheme.bodyMedium!
                                  .copyWith(
                                    color: Theme.of(context)
                                        .textTheme
                                        .bodyLarge!
                                        .color!
                                        .withValues(alpha: 0.8),
                                  ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),
                        TextField(
                          controller: _loginController,
                          decoration: InputDecoration(
                            labelText: 'Username',
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.black),
                            ),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _emailController,
                          //obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Email',
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.black),
                            ),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _firstNameController,
                          //obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'First Name',
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.black),
                            ),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _lastNameController,
                          //obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Last Name',
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.black),
                            ),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Password',
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.black),
                            ),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _login,
                          style: style,
                          child: _isLoading
                              ? const CircularProgressIndicator()
                              : const Text(
                                  'Sign Up',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                        const SizedBox(height: 16),
                        if (_errorMessage.isNotEmpty)
                          Text(
                            _errorMessage,
                            style: const TextStyle(
                              color: Colors.red,
                              fontSize: 14,
                            ),
                            textAlign: TextAlign.center,
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  Widget build(BuildContext context) {
    final ButtonStyle style = ElevatedButton.styleFrom(
      textStyle: const TextStyle(fontSize: 20),
      backgroundColor: green,
      padding: const EdgeInsets.symmetric(vertical: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
    );
    return Scaffold(
      appBar: CustomAppBar(),
      drawer: CustomDrawer(),
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage("assets/images/woodBG.jpg"),
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  color: black,
                  child: Text(
                    'OPTIONS',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const Divider(height: 5, thickness: 5, color: green),
                Container(
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage("assets/images/WoodGrain.jpg"),
                      fit: BoxFit.fill,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Join Game / Create Game Buttons
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const CreatePage(),
                              ),
                            );
                          },
                          style: style,
                          child: const Text(
                            'CREATE GAME',
                            style: TextStyle(
                              fontSize: 16,
                              color: white,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const JoinPage(),
                              ),
                            );
                          },
                          style: style,
                          child: const Text(
                            'JOIN GAME',
                            style: TextStyle(
                              fontSize: 16,
                              color: white,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }
}

class CreatePage extends StatefulWidget {
  const CreatePage({super.key});
  @override
  State<CreatePage> createState() => _CreatePageState();
}

class _CreatePageState extends State<CreatePage> {
  bgio.Lobby lobby = bgio.Lobby(Uri.parse('http://rickymetral.xyz:5000'));
  bgio.Client? client0;
  bool _isLoading = false;
  String _errorMessage = '';
  //bool wasPressed = false;

  Future<bgio.Client> _join(bgio.Game game, bgio.MatchData matchData, int index, String name) {
    return lobby.joinMatch(game, matchData.players[index].id, name: name);
  }

  void _createMatch() async {
    bgio.GameDescription description = bgio.GameDescription('domino', 2);
    bgio.MatchData matchData = await lobby.createMatch(description);
    bgio.Game game = matchData.toGame(); // works now
    //rint(matchData.players);

    bgio.Client client0 = await _join(game, matchData, 0, player.firstName);
    setState(() {
      //wasPressed = true;
      player.isHost = true;
    });
    //print(matchData.players);
    //bgio.Client clientO = await _join(game, matchData, 1, 'Player O');
    //bgio.Client bannerClient = lobby.watchMatch(game);

    setState(() {
      this.client0 = client0;
      client0.start();
    });

    try {
    /*client0.start();
    await Future.delayed(Duration(seconds: 5)); // why does it only work with 5 seconds
    final response = await lobby.getMatch('domino', matchData.matchID);
    if(response == null) {
      wasPressed = false;
      _errorMessage = "Lobby is full or does not exist";
      return; // throw an error message instead
    }
    setState(() {
      matchData = response; // definitely not null
      //print(matchData);
    });*/
    
    if (mounted) {
          setState(() {
            player.isHost = false;
          });
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => LobbyPage(),
                  settings: RouteSettings(
                    arguments: {
                      'matchID': matchData.matchID,
                      'lobby' : lobby,
                      //'game' : game,
                      //'matchData' : matchData,
                    },
                ),
              ),
            );
          }
    } catch(e) {
      _errorMessage = "Lobby is full or does not exist";
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final ButtonStyle style = ElevatedButton.styleFrom(
      textStyle: const TextStyle(fontSize: 20),
      backgroundColor: green,
      padding: const EdgeInsets.symmetric(vertical: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
    );
    return Scaffold(
      appBar: CustomAppBar(),
      drawer: CustomDrawer(),
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage("assets/images/woodBG.jpg"),
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  color: black,
                  child: Text(
                    'CHOOSE OPPONENTS',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const Divider(height: 5, thickness: 5, color: green),
                Container(
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage("assets/images/WoodGrain.jpg"),
                      fit: BoxFit.fill,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Choose Opponents
                        const SizedBox(height: 24),
                        ElevatedButton(
                          //onPressed: _isLoading ? null : _generateMatch,
                          onPressed: _isLoading ? null : _createMatch,
                          style: style,
                          child: const Text(
                            '1v1',
                            style: TextStyle(
                              fontSize: 16,
                              color: white,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }
}


class JoinPage extends StatefulWidget {
  const JoinPage({super.key});
  @override
  State<JoinPage> createState() => _JoinPageState();
}

class _JoinPageState extends State<JoinPage> {
  bgio.Lobby lobby = bgio.Lobby(Uri.parse('http://rickymetral.xyz:5000'));
  bgio.Client? client1;
  final TextEditingController _roomCodeController = TextEditingController(); // not hooked up right now
  String matchID = '';
  bool _isLoading = false;
  String _errorMessage = '';
  bool wasPressed = false;

  Future<bgio.Client> _join(bgio.Game game, bgio.MatchData matchData, int index, String name) {
    return lobby.joinMatch(game, matchData.players[index].id, name: name);
  }

  void _joinMatch() async {
    setState(() {
        wasPressed = true;
        matchID = _roomCodeController.text;
    });
    final response = await lobby.getMatch('domino', matchID);
    if(response == null) {
      wasPressed = false;
      _errorMessage = "Lobby is full or does not exist";
      return; // throw an error message instead
    }
    bgio.MatchData matchData = response; // definitely not null
    bgio.Game game = matchData.toGame(); // works now
    
    try {
      bgio.Client client1 = await _join(game, matchData, 1, player.firstName);
    setState(() {
      this.client1 = client1;
    });
    client1.start();
    /*await Future.delayed(Duration(seconds: 5)); // why does it only work with 5 seconds
    final response2 = await lobby.getMatch('domino', matchID);
    if(response2 == null) {
      wasPressed = false;
      _errorMessage = "Lobby is full or does not exist";
      return; // throw an error message instead
    }
    setState(() {
      matchData = response2; // definitely not null
      //print(matchData);
    });*/
    
    if (mounted) {
          setState(() {
            player.isHost = false;
          });
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => LobbyPage(),
                  settings: RouteSettings(
                    arguments: {
                      'matchID': _roomCodeController.text,
                      'lobby' : lobby,
                      //'game' : game,
                      //'matchData' : matchData,
                    },
                ),
              ),
            );
          }
    } catch(e) {
      _errorMessage = "Lobby is full or does not exist";
    }
  }

  @override
  Widget build(BuildContext context) {
    final ButtonStyle style = ElevatedButton.styleFrom(
      textStyle: const TextStyle(fontSize: 20),
      backgroundColor: green,
      padding: const EdgeInsets.symmetric(vertical: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
    );
    return Scaffold(
      appBar: CustomAppBar(),
      drawer: CustomDrawer(),
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage("assets/images/woodBG.jpg"),
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  color: black,
                  child: Text(
                    'JOIN GAME',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const Divider(height: 5, thickness: 5, color: green),
                Container(
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage("assets/images/WoodGrain.jpg"),
                      fit: BoxFit.fill,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Join Game
                        const SizedBox(height: 24),
                        TextField(
                          controller: _roomCodeController,
                          //obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Room Code',
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.black),
                            ),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: wasPressed ? null : () {
                            _joinMatch();
                          },
                          style: style,
                          child: const Text(
                            'JOIN',
                            style: TextStyle(
                              fontSize: 16,
                              color: white,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _roomCodeController.dispose();
    super.dispose();
  }
}

class LobbyPage extends StatefulWidget {
  const LobbyPage({super.key});
  @override
  State<LobbyPage> createState() => _LobbyPageState();
}

class _LobbyPageState extends State<LobbyPage> {
  Timer? timer;
  //String matchID = '';
  String player0Name = '';
  String player1Name = '';
  bool startGame = false;
  bool isFull = false;

  @override
  void initState() {
  super.initState();
  }

  /*Future<Map<String, dynamic>> getMatch(String matchID) async {
    // Replace with Game pass
    final response = await http.get(
      Uri.parse('http://rickymetral.xyz:5000/games/domino/$matchID'),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to get match: ${response.body}');
    }

    final data = jsonDecode(response.body);
    if(mounted) {
      setState(() {
        player0Name = data['players'][0]['name'];
        if (data['players'].length > 1 && data['players'][1]['name'] != null) {
          player1Name = data['players'][1]['name'];
        }
        if(data['players'][1]['name'] != null) {
          isFull = true;
          if(player.isHost) {
            startGame = true;
          }
        } else {
          isFull = false;
          startGame = false;
        }
      });
    }
    //print(data['players']);
    //print (data['players'][0]['name']);

    return data;
  }*/

  Future<void> markStarted(String matchID) async {
    final response = await http.post(
      Uri.parse('http://rickymetral.xyz:5000/games/domino/$matchID/update'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'playerID': player.isHost ? "0" : "1",
        'credentials': player.playerCredentials, // player.playerCredentials,
        'data': {'started': true},
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update match: ${response.body}');
    }
  }

  Future<void> handleStart(String matchID) async {
    try {
      await markStarted(matchID);
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
          //final session = GameSession(credentials: player.playerCredentials, matchID: matchID, playerID: player.isHost ? "0" : "1");
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => GamePage(),
                  settings: RouteSettings(
                    arguments: {
                      //'session': session,
                      'matchID': matchID,
                      'playerID': player.isHost ? "0" : "1",
                      'credentials': player.playerCredentials,
                      //'numPlayers': 2,
                    },
                ),
              ),
            );
          }
    } catch (error) {
      print('Error starting game: $error');
    }
  }

  Future<void> poll(match) async {
      await Future.delayed(const Duration(seconds: 2));
      try {
        bgio.MatchData matchData = await match['lobby'].getMatch('domino', match['matchID']);
        if(matchData.players[0].isSeated) {
          setState(() {
            player0Name = matchData.players[0].name;
          });
        } 
        if(matchData.players[1].isSeated) {
          setState(() {
            player1Name = matchData.players[1].name;
          });
        } 
        //final meta = match['matchData'];
        print(matchData);
        /*if(!player.isHost && meta['players']?[0]?['data']?['started'] == true) {
          if (mounted) {
            timer?.cancel();
            //final session = GameSession(credentials: player.playerCredentials, matchID: matchID, playerID: player.isHost ? "0" : "1");
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                  builder: (context) => GamePage(),
                    settings: RouteSettings(
                      arguments: {
                        'matchID': matchID,
                        'playerID': player.isHost ? "0" : "1",
                        'credentials': player.playerCredentials,
                        'numPlayers': 2,
                      },
                  ),
                ),
              );
            }
        }*/
      } catch (error) {
        print('Error polling match: $error');
      }
    }

  //final TextEditingController _roomCodeController = TextEditingController();
  @override
  Widget build(BuildContext context) {
    //print("Player in Lobby: ${player.firstName}");
    final match = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    
    //bgio.MatchData matchData = response; // definitely not null
    //bgio.Game game = matchData.toGame(); // works now
    //bgio.MatchData matchData = match['matchData'];
    //bgio.Game game = match['game'];
    if(mounted) {
    try {
      //getMatch(game.matchID);
    } catch(e) {
      print(e);
    }
    //initState();r
  
  if(match['matchID'].isNotEmpty && mounted && !player.isHost) {
    poll(match);
    timer = Timer.periodic(
      const Duration(seconds: 2),
      (_) => poll(match),
    );

  }

    }
    final ButtonStyle style = ElevatedButton.styleFrom(
      textStyle: const TextStyle(fontSize: 20),
      backgroundColor: green,
      padding: const EdgeInsets.symmetric(vertical: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
    );
    return Scaffold(
      appBar: CustomAppBar(),
      drawer: CustomDrawer(),
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage("assets/images/woodBG.jpg"),
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  color: black,
                  child: Text(
                    'MATCH LOBBY',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const Divider(height: 5, thickness: 5, color: green),
                Container(
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage("assets/images/WoodGrain.jpg"),
                      fit: BoxFit.fill,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 24),
                        Text(
                          'Room Code:',
                          style: TextStyle(
                            fontSize: 16,
                            color: white,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        // Change to Room Code
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            match['matchID'],
                            style: TextStyle(
                              fontSize: 16,
                              color: white,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 24),
                        Text(
                          'Players in Lobby:',
                          style: TextStyle(
                            fontSize: 16,
                            color: white,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                // If player.isHost is true, print player.firstName here
                                // If not, get the host's name and place it here
                              player0Name.isEmpty ? '...' : player0Name,
                              style: TextStyle(
                                fontSize: 16,
                                color: white,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.left,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '(Host)',
                              style: TextStyle(
                                fontSize: 16,
                                color: green2,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.right,
                            ),
                            ]
                            )
                          /*child: Text(
                            'Host',
                            style: TextStyle(
                              fontSize: 16,
                              color: white,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),*/
                        ),
                        const SizedBox(height: 24),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            // If player.isHost is false, print player.firstName here
                            // If not, get the other player's name and place it here. 
                            // If no other player, print (waiting...)
                            player1Name.isEmpty ? '(waiting...)' : player1Name,
                            style: TextStyle(
                              fontSize: 16,
                              color: white,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.left,
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: !startGame ? null : () {
                            handleStart(match['matchID']);
                          },
                          style: style,
                          child: Text(
                            startGame ? 'Start Game' : 'Waiting for Players...',
                            style: TextStyle(
                              fontSize: 16,
                              color: white,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }
}

class GamePage extends StatefulWidget {
  const GamePage({super.key});
  @override
  State<GamePage> createState() => _GamePageState();
}


class _GamePageState extends State<GamePage> {
  //String matchID = '';
  bool _isLoading = false;
  String _errorMessage = '';

  @override
  Widget build(BuildContext context) {
    //final matchID = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final ButtonStyle style = ElevatedButton.styleFrom(
      textStyle: const TextStyle(fontSize: 20),
      backgroundColor: green,
      padding: const EdgeInsets.symmetric(vertical: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
    );
    return Scaffold(
      appBar: CustomAppBar(),
      drawer: CustomDrawer(),
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage("assets/images/woodBG.jpg"),
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                /*Container(
                  color: black,
                  child: Text(
                    'GAME',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const Divider(height: 5, thickness: 5, color: green),*/
                Container(
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage("assets/images/WoodGrain.jpg"),
                      fit: BoxFit.fill,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Opponent's panel
                        const SizedBox(height: 12),
                        Text(
                          'Opponent', // get session information and print opponent's name here
                          style: TextStyle(
                              fontSize: 16,
                              color: white,
                              fontWeight: FontWeight.bold,
                              shadows: [
                                Shadow(
                                  blurRadius: 10.0, // shadow softness
                                  color: black,
                                  offset: Offset(-.5, 1.0),
                                ),
                              ],
                              ), 
                          textAlign: TextAlign.center,
                          ),
                        const SizedBox(height: 12),
                      ],
                    ),
                  ),
                ),
                // Panel for the game board 
                Container(

                ),
                // Buttons above player
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  spacing: 10,
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        // Draw functionality
                      },
                      style: style,
                      child: const Text(
                        'Draw',
                        style: TextStyle(
                          fontSize: 16,
                          color: white,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        // Pass functionality
                      },
                      style: style,
                      child: const Text(
                        'Pass',
                        style: TextStyle(
                          fontSize: 16,
                          color: white,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
                Container(
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage("assets/images/WoodGrain.jpg"),
                      fit: BoxFit.fill,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Player's panel
                        const SizedBox(height: 12),
                        Text(
                          player.firstName, 
                          style: TextStyle(
                              fontSize: 16,
                              color: white,
                              fontWeight: FontWeight.bold,
                              shadows: [
                                Shadow(
                                  blurRadius: 10.0,
                                  color: black,
                                  offset: Offset(-.5, 1.0),
                                ),
                              ],
                              ), 
                          textAlign: TextAlign.center,
                          ),
                        const SizedBox(height: 12),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }
}

class MatchRecord {
  final String matchID;
  final String player;
  final String opponent;
  final String result;

  MatchRecord({
    required this.matchID,
    required this.player,
    required this.opponent,
    required this.result,
  });

  factory MatchRecord.fromJson(Map<String, dynamic> json) {
    return MatchRecord(
      matchID: json['matchID'],
      player: json['player'],
      opponent: json['opponent'],
      result: json['result'],
    );
  }
}
 
// Not fully implemented 
class MatchHistoryPage extends StatefulWidget {
  const MatchHistoryPage({super.key});
  @override
  State<MatchHistoryPage> createState() => _MatchHistoryPageState();
}

class _MatchHistoryPageState extends State<MatchHistoryPage> {
  String matchID = '';
  bool _isLoading = false;
  String _errorMessage = '';

  @override
  Widget build(BuildContext context) {
    //final matchID = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final ButtonStyle style = ElevatedButton.styleFrom(
      textStyle: const TextStyle(fontSize: 20),
      backgroundColor: green,
      padding: const EdgeInsets.symmetric(vertical: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
    );
    return Scaffold(
      appBar: CustomAppBar(),
      drawer: CustomDrawer(),
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage("assets/images/woodBG.jpg"),
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  color: black,
                  child: Text(
                    'MATCH HISTORY',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const Divider(height: 5, thickness: 5, color: green),
                Container(
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage("assets/images/WoodGrain.jpg"),
                      fit: BoxFit.fill,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Join Game
                        const SizedBox(height: 24),
                        const SizedBox(height: 24),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }
}