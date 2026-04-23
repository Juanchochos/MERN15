import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:google_fonts/google_fonts.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'dart:convert';
import 'drawer.dart';
import 'package:boardgame_io/boardgame.dart' as bgio;
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';
//import 'package:provider/provider.dart';
//import 'package:socket_io_client/socket_io_client.dart' as IO;

const Color black = Color.fromARGB(255, 14, 7, 2);
const Color white = Color.fromARGB(255, 240, 223, 211);
const Color beige = Color.fromARGB(255, 207, 172, 148);
const Color green = Color.fromARGB(255, 37, 149, 6);
const Color green2 = Color.fromARGB(255, 57, 201, 34);
const String backendBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://rickymetral.xyz:5000',
);

Uri buildBackendUri(String path) {
  return Uri.parse('$backendBaseUrl$path');
}

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

bgio.Client? client;
bgio.ClientContext? _ctx;

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
          bodyMedium: TextStyle(color: white, fontSize: 30),
          bodyLarge: TextStyle(
            color: white,
            fontSize: 28,
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
  String _verificationMessage = '';
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
        buildBackendUri('/api/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'login': _loginController.text,
          'password': _passwordController.text,
        }),
      );
      final dynamic decodedResponse = jsonDecode(response.body);
      final Map<String, dynamic> data =
          decodedResponse is Map<String, dynamic> ? decodedResponse : {};

      if (response.statusCode == 200) {
        if (data['error'] == null || data['error'].toString().isEmpty) {
          _verificationMessage = data['message'] ?? '';
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) =>
                    CodeVerificationPage(login: _loginController.text),
              ),
            );
          }
        } else {
          setState(() {
            _errorMessage = data['error'].toString();
          });
        }
      } else if (data['error'] != null &&
          data['error'].toString().isNotEmpty) {
        setState(() {
          _errorMessage = data['error'].toString();
        });
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
                                      decoration: TextDecoration.underline,
                                      decorationColor: green,
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
                            ),
                            textAlign: TextAlign.center,
                          ),
                        if (_errorMessage.isNotEmpty)
                        const SizedBox(height: 16),
                        Align(
                          alignment: Alignment.center,
                          child: TextButton(
                            // remove const to allow for navigation
                            onPressed: () {
                              Navigator.pushReplacement(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const ResetPasswordPage(),
                                ),
                              );
                            },
                            child: Text.rich(
                              const TextSpan(
                                children: [
                                  TextSpan(
                                    text: 'Forgot Password?',
                                    style: TextStyle(
                                      color: green,
                                      fontWeight: FontWeight.bold,
                                      decoration: TextDecoration.underline,
                                      decorationColor: green,
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

class CodeVerificationPage extends StatefulWidget {
  final String login;
  const CodeVerificationPage({
    super.key,
    required this.login,
    });
  @override
  State<CodeVerificationPage> createState() => _CodeVerificationPage();
}

class _CodeVerificationPage extends State<CodeVerificationPage> {
  final TextEditingController _codeController = TextEditingController();
  String _errorMessage = '';
  bool _isLoading = false;
  String accessToken = '';

  Future<void> _login() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });
    try {
      print(widget.login);
      print(_codeController.text);
      final response = await http.post(
        buildBackendUri('/api/verify-login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'login': widget.login,
          'code': _codeController.text,
        }),
      );
      final dynamic decodedResponse = jsonDecode(response.body);
      final Map<String, dynamic> data =
          decodedResponse is Map<String, dynamic> ? decodedResponse : {};
      if (response.statusCode == 200) {
        Map<String, dynamic> decoded = JwtDecoder.decode(data['accessToken']);
        player = Player.fromJson(decoded);
        //print("Player ID: ${player.userId}, First Name: ${player.firstName}, Last Name: ${player.lastName}");

        if (data['error'] == null || data['error'].isEmpty) {
          // Login successful, navigate to home page
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => HomePage()),
            );
          }
        } else {
          setState(() {
            _errorMessage = data['error'].toString();
          });
        }
      } else if (data['error'] != null &&
          data['error'].toString().isNotEmpty) {
        setState(() {
          _errorMessage = data['error'].toString();
        });
      } else {
        setState(() {
          _errorMessage = 'Wrong code entered. Please try again.';
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
                          child: Text(
                                'Enter the 6-digit code we emailed to you.',
                              ),
                          ),

                        const SizedBox(height: 16),
                        TextField(
                          controller: _codeController,
                          decoration: InputDecoration(
                            labelText: 'Verification Code',
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
                                  'Verify Code',
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
    _codeController.dispose();
    super.dispose();
  }
}

class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({super.key});
  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final TextEditingController _loginController = TextEditingController();
  String _errorMessage = '';
  bool _isLoading = false;
  //String _message = '';
  String accessToken = '';
  Future<void> _sendCode() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });
    try {
      final response = await http.post(
        buildBackendUri('/api/request-password-reset'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'login': _loginController.text,
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
            _errorMessage = 'Password reset code sent.';
            /*Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => no()),
            );*/
          }
        } else {
          setState(() {
            _errorMessage = data['error'];
          });
        }
      } else {
        setState(() {
          _errorMessage = 'Unable to send password reset code.';
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
                        const Text(
                         'Enter your username and we\'ll email a 6-digit reset code to the address on file.',
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _loginController,
                          decoration: const InputDecoration(
                            labelText: 'Username',
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.black),
                            ),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _sendCode,
                          style: style,
                          child: _isLoading
                              ? const CircularProgressIndicator()
                              : const Text(
                                  'Send Code',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(builder: (context) => LoginPage()),
                            );
                          }
                          ,
                          style: style,
                          child: _isLoading
                              ? const CircularProgressIndicator()
                              : const Text(
                                  'Back',
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
        buildBackendUri('/api/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'login': _loginController.text,
          'password': _passwordController.text,
          'firstName': _firstNameController.text,
          'lastName': _lastNameController.text,
          'email': _emailController.text,
        }),
      );
      final dynamic decodedResponse = jsonDecode(response.body);
      final Map<String, dynamic> data =
          decodedResponse is Map<String, dynamic> ? decodedResponse : {};

      if (response.statusCode == 201) {
        if (data['requiresVerification'] == true) {
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => SignupVerificationPage(
                  login: _loginController.text,
                  email: _emailController.text,
                ),
              ),
            );
          }
        } else if (data['accessToken'] != null) {
          Map<String, dynamic> decoded = JwtDecoder.decode(data['accessToken']);
          player = Player.fromJson(decoded);

          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => HomePage()),
            );
          }
        } else if (data['error'] == null || data['error'].toString().isEmpty) {
          setState(() {
            _errorMessage = 'Signup failed. Please try again.';
          });
        } else {
          setState(() {
            _errorMessage = data['error'].toString();
          });
        }
      } else if ((response.statusCode == 400 || response.statusCode == 409) &&
          data['error'] != null &&
          data['error'].toString().isNotEmpty) {
        setState(() {
          _errorMessage = data['error'].toString();
        });
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

class SignupVerificationPage extends StatefulWidget {
  final String login;
  final String email;

  const SignupVerificationPage({
    super.key,
    required this.login,
    required this.email,
  });

  @override
  State<SignupVerificationPage> createState() => _SignupVerificationPageState();
}

class _SignupVerificationPageState extends State<SignupVerificationPage> {
  final TextEditingController _codeController = TextEditingController();
  String _errorMessage = '';
  bool _isLoading = false;

  Future<void> _verifySignup() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final response = await http.post(
        buildBackendUri('/api/verify-signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'login': widget.login,
          'code': _codeController.text,
        }),
      );

      final dynamic decodedResponse = jsonDecode(response.body);
      final Map<String, dynamic> data =
          decodedResponse is Map<String, dynamic> ? decodedResponse : {};

      if (response.statusCode == 200 && data['accessToken'] != null) {
        Map<String, dynamic> decoded = JwtDecoder.decode(data['accessToken']);
        player = Player.fromJson(decoded);

        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => HomePage()),
          );
        }
      } else if (data['error'] != null && data['error'].toString().isNotEmpty) {
        setState(() {
          _errorMessage = data['error'].toString();
        });
      } else {
        setState(() {
          _errorMessage = 'Verification failed. Please try again.';
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
              MaterialPageRoute(builder: (context) => const SignupPage()),
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
                        Text(
                          'Enter the 6-digit code we emailed to ${widget.email}.',
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _codeController,
                          decoration: const InputDecoration(
                            labelText: 'Verification Code',
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.black),
                            ),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _verifySignup,
                          style: style,
                          child: _isLoading
                              ? const CircularProgressIndicator()
                              : const Text(
                                  'Verify Email',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const SignupPage(),
                              ),
                            );
                          },
                          style: style,
                          child: const Text(
                            'Back',
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
    _codeController.dispose();
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
  bgio.Lobby lobby = bgio.Lobby(Uri.parse(backendBaseUrl));


  bool _isLoading = false;
  String _errorMessage = '';
  //bool wasPressed = false;

  Future<bgio.Client> _join(
    bgio.Game game,
    bgio.MatchData matchData,
    int index,
    String name,
  ) {
    return lobby.joinMatch(game, matchData.players[index].id, name: name);
  }

  void _createMatch() async {
    bgio.GameDescription description = bgio.GameDescription('domino', 2);
    bgio.MatchData matchData = await lobby.createMatch(description);
    bgio.Game game = matchData.toGame(); // works now
    //rint(matchData.players);

    bgio.Client client0 = await _join(game, matchData, 0, player.firstName);
    //print(matchData.players);
    //bgio.Client clientO = await _join(game, matchData, 1, 'Player O');
    //bgio.Client bannerClient = lobby.watchMatch(game);

    setState(() {
      client = client0;
      client?.subscribe(_update);
      client?.start();
      player.playerCredentials = client?.credentials;
    });

    try {
      if (mounted) {
        setState(() {
          //wasPressed = true;
          player.isHost = true;
        });
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => LobbyPage(),
            settings: RouteSettings(
              arguments: {
                'matchID': matchData.matchID,
                'lobby': lobby,
                //'game' : game,
                //'matchData' : matchData,
              },
            ),
          ),
        );
      }
    } catch (e) {
      _errorMessage = "Lobby is full or does not exist";
    }
  }
  
  void _update(Map<String, dynamic> G, bgio.ClientContext ctx) {
    setState(() {
      //_isPlaying = !ctx.isGameOver && ctx.currentPlayer == widget.client.playerID;
      _ctx = ctx;
      /*_graveyard = graveyard G['graveyard'];
      _hand = hand G['hands'];
      _board = board G['board'];
      _boardEnds = boardEnds G['boardEnds'];
      _passcount = passcount G['passCount'];*/
    });
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
  bgio.Lobby lobby = bgio.Lobby(Uri.parse(backendBaseUrl));
  final TextEditingController _roomCodeController =
      TextEditingController(); // not hooked up right now
  String matchID = '';
  bool _isLoading = false;
  String _errorMessage = '';
  bool wasPressed = false;

  Future<bgio.Client> _join(
    bgio.Game game,
    bgio.MatchData matchData,
    int index,
    String name,
  ) {
    return lobby.joinMatch(game, matchData.players[index].id, name: name);
  }

  void _joinMatch() async {
    setState(() {
      wasPressed = true;
      matchID = _roomCodeController.text;
    });
    final response = await lobby.getMatch('domino', matchID);
    if (response == null) {
      wasPressed = false;
      _errorMessage = "Lobby is full or does not exist";
      return; // throw an error message instead
    }
    bgio.MatchData matchData = response; // definitely not null
    bgio.Game game = matchData.toGame(); // works now

    //game.

    try {
      bgio.Client client1 = await _join(game, matchData, 1, player.firstName);
      setState(() {
        client = client1;
        client?.subscribe(_update);
        client?.start();
        player.playerCredentials = client?.credentials;
      });

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
                'lobby': lobby,
                //'game' : game,
                //'matchData' : matchData,
              },
            ),
          ),
        );
      }
    } catch (e) {
      _errorMessage = "Lobby is full or does not exist";
    }
  }

  void _update(Map<String, dynamic> G, bgio.ClientContext ctx) {
    setState(() {
      //_isPlaying = !ctx.isGameOver && ctx.currentPlayer == widget.client.playerID;
      _ctx = ctx;
      /*_graveyard = graveyard G['graveyard'];
      _hand = hand G['hands'];
      _board = board G['board'];
      _boardEnds = boardEnds G['boardEnds'];
      _passcount = passcount G['passCount'];*/
    });
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
                          onPressed: wasPressed
                              ? null
                              : () {
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

  Future<void> markStarted(String matchID) async {
    //lobby.updatePlayer(gameClient, newName)

    final response = await http.post(
      buildBackendUri('/games/domino/$matchID/update'),
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

  Future<void> handleStart(Map<String, dynamic> match) async {
    try {
      //print(match);
      print(
        'Match type: ${match.runtimeType}',
      ); // Is this 'List' or '_InternalLinkedHashMap'?
      bgio.Lobby lobby = match['lobby'];
      final response = await lobby.getMatch('domino', match['matchID']);
      if (response == null) {
        return;
      }
      bgio.MatchData matchData = response;
      await markStarted(matchData.matchID);
      await Future.delayed(const Duration(seconds: 5));
      final response2 = await lobby.getMatch('domino', match['matchID']);
      if (response2 == null) {
        return;
      }
      matchData = response2;
      bgio.Game game = matchData.toGame();
      //print(matchData.playerCredentials)
      if (mounted && isFull) {
        //final session = GameSession(credentials: player.playerCredentials, matchID: matchID, playerID: player.isHost ? "0" : "1");
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => GamePage(),
            settings: RouteSettings(
              arguments: {
                //'session': session,
                'game': game,
                'matchData': matchData,
                'matchID': matchData.matchID,
                'playerID': player.isHost ? 0 : 1,
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

  Future<void> poll(Map<String, dynamic> match) async {
    await Future.delayed(const Duration(seconds: 2));
    try {
      bgio.MatchData matchData = await match['lobby'].getMatch(
        'domino',
        match['matchID'],
      );
      // Setting names
      if (mounted) {
        setState(() {
          if (matchData.players[0].isSeated) {
            player0Name = matchData.players[0].name;
          } else {
            player0Name = '';
          }

          if (matchData.players[1].isSeated) {
            player1Name = matchData.players[1].name;
            isFull = true;
            if (player.isHost) {
              startGame = true;
            }
          } else {
            player1Name = '';
            isFull = false;
            startGame = false;
          }
        });
      }
      bgio.Game game = matchData.toGame();
      if (!player.isHost && matchData.players[0].isConnected == true) {
        if (mounted) {
          timer?.cancel();
          //final session = GameSession(credentials: player.playerCredentials, matchID: matchID, playerID: player.isHost ? "0" : "1");
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => GamePage(),
              settings: RouteSettings(
                arguments: {
                  'game': game,
                  'matchData': matchData,
                  'matchID': matchData.matchID,
                  'playerID': player.isHost ? "0" : "1",
                  'credentials': player.playerCredentials,
                  'numPlayers': 2,
                },
              ),
            ),
          );
        }
      }
    } catch (error) {
      print('Error polling match: $error');
    }
  }

  //final TextEditingController _roomCodeController = TextEditingController();
  @override
  Widget build(BuildContext context) {
    //print("Player in Lobby: ${player.firstName}");
    final match =
        ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    if (mounted) {
      if (match['matchID'].isNotEmpty && mounted) {
        poll(match);
        timer = Timer.periodic(const Duration(seconds: 2), (_) => poll(match));
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
                            ],
                          ),
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
                          onPressed: !startGame
                              ? null
                              : () {
                                  handleStart(match);
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

class PlayerConfig {
  final String playerID;
  final String username;
  final int team;

  PlayerConfig({
    required this.playerID,
    required this.username,
    required this.team
  });

  Map<String, dynamic> toJson() => {
        'playerID': playerID,
        'username': username,
        'team': team,
      };
}

class GamePage extends StatefulWidget {
  const GamePage({super.key});
  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  late final WebViewController _webController;
  bool _isLoaded = false;

  @override
  void initState() {
    super.initState();

  late final PlatformWebViewControllerCreationParams params;
  
  if (WebViewPlatform.instance is WebKitWebViewPlatform) {
    // iOS/macOS specific setup
    params = WebKitWebViewControllerCreationParams(
      allowsInlineMediaPlayback: true,
    );
  } else {
    // Android/Default setup
    params = const PlatformWebViewControllerCreationParams();
  }
    _webController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onWebResourceError: (WebResourceError error) {
            debugPrint('''
              Page resource error:
              code: ${error.errorCode}
              description: ${error.description}
            ''');
          },
        ),
      );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    if (!_isLoaded) {
      final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
      PlayerConfig playerConfig = PlayerConfig(
        playerID: args['playerID'].toString(),
        username: player.firstName,
        team: player.isHost? 0 : 1,
      );

      final String configs = Uri.encodeComponent(jsonEncode([playerConfig.toJson()]));

      final String url = 'https://rickymetral.xyz/game'
          '?matchID=${args['matchID']}'
          '&playerID=${args['playerID']}'
          '&credentials=${Uri.encodeComponent(args['credentials'])}';
          //'&playerConfigs=$configs'
          //;

      _webController.loadRequest(Uri.parse(url));
      _isLoaded = true;
    }
  }

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
      body: WebViewWidget(controller: _webController),
      /*
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
                  /*child: Padding(
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
                Container(
                // Panel for the game board

                ),
                Row(
                // Buttons above player
                  mainAxisAlignment: MainAxisAlignment.center,
                  spacing: 10,
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        // Insert Draw functionality
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
                        // Insert Pass functionality
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
                  ),*/

                  
                  /*child: Board(
                    G: client!.G,         // The game state (hands, board, etc.)
                    ctx: client!.ctx,     // The context (currentPlayer, gameover)
                    client: client!,      // The client instance to call moves
                  ),*/
                ),
              ],
            ),
          ),
        ),
      ),*/

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

  Future<void> match() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });
    try {
      //print(widget.login);
      //print(_codeController.text);
      final response = await http.get(
        Uri.parse('http://rickymetral.xyz:5000/api/fetch-match-history?userId=${player.userId}'),
        headers: {'Content-Type': 'application/json'},
      );
      final data = await jsonDecode(response.body);
      if (response.statusCode == 200) {
        //print("Player ID: ${player.userId}, First Name: ${player.firstName}, Last Name: ${player.lastName}");
        if(data['accessToken'] != null) {
          //sessionStorage['token_data'] = data['accessToken'];
          //print("Token stored in sessionStorage: ${sessionStorage['token_data']}");
        }
        //print(data['data']);
        //List<MatchRecord> matchHistory = (data['data'] as List).map((json) => MatchRecord.fromJson(json)).toList();
        //print(matchHistory);
      } else {
        setState(() {
          _errorMessage = 'Unable to show match history. Please try again later.';
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
                        // Games
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
