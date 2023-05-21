import 'package:shared_preferences/shared_preferences.dart';

class InternalDB {
  // 생성된 Singleton 인스턴스를 저장하기 위한 static 변수
  static final InternalDB _singleton = InternalDB._internal();
  SharedPreferences? _prefs;
  // 외부에서 새로운 Singleton 객체를 만들 수 없도록 생성자를 private으로 설정
  factory InternalDB() {
    return _singleton;
  }

  // Singleton 인스턴스를 초기화하는 private 생성자
  InternalDB._internal();

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  Future<void> set(String key, String value) async {
    await _prefs?.setString(key, value);
  }

  String? get(String key) {
    return _prefs?.getString(key);
  }
}