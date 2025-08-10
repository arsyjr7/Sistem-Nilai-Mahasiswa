import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as SQLite from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
interface Student {
  id: number;
  nama: string;
  nim: string;
  mata_kuliah: string;
  nilai_tb1: number;
  nilai_tb2: number;
  nilai_uas: number;
  nilai_akhir: number;
  grade: string;
  created_at: string;
}

// Database setup
let db: SQLite.SQLiteDatabase | null = null;

const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('mahasiswa.db');
  }
  return db;
};

const initDatabase = async (): Promise<void> => {
  const database = await openDatabase();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      nim TEXT NOT NULL,
      mata_kuliah TEXT NOT NULL,
      nilai_tb1 REAL NOT NULL,
      nilai_tb2 REAL NOT NULL,
      nilai_uas REAL NOT NULL,
      nilai_akhir REAL NOT NULL,
      grade TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export default function StudentGradeApp(): React.JSX.Element {
  const [students, setStudents] = useState<Student[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form state
  const [nama, setNama] = useState<string>('');
  const [nim, setNim] = useState<string>('');
  const [mataKuliah, setMataKuliah] = useState<string>('Analisa Berorientasi Objek');
  const [nilaiTB1, setNilaiTB1] = useState<string>('');
  const [nilaiTB2, setNilaiTB2] = useState<string>('');
  const [nilaiUAS, setNilaiUAS] = useState<string>('');

  const mataKuliahOptions: string[] = [
    'Analisa Berorientasi Objek',
    'Mobile Programming',
    'Machine Learning',
    'Pengantar Data Science',
    'Algoritma dan Struktur Data',
    'Basis Data',
    'Pemrograman Web'
  ];

  // Initialize database and load data
  useEffect(() => {
    const initialize = async (): Promise<void> => {
      try {
        await initDatabase();
        await loadStudents();
      } catch (error) {
        console.error('Error initializing app:', error);
        Alert.alert('Error', 'Gagal menginisialisasi aplikasi');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const loadStudents = async (): Promise<void> => {
    try {
      const database = await openDatabase();
      const result = await database.getAllAsync('SELECT * FROM students ORDER BY created_at DESC');
      setStudents(result as Student[]);
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Gagal memuat data mahasiswa');
    }
  };

  const calculateGrade = (nilaiAkhir: number): string => {
    if (nilaiAkhir >= 80) return 'A';
    if (nilaiAkhir >= 75) return 'B+';
    if (nilaiAkhir >= 69) return 'B';
    if (nilaiAkhir >= 65) return 'C+';
    if (nilaiAkhir >= 56) return 'C';
    return 'D';
  };

  const calculateFinalScore = (tb1: number, tb2: number, uas: number): number => {
    return (tb1 * 0.3) + (tb2 * 0.3) + (uas * 0.4);
  };

  const validateInput = (): boolean => {
    if (!nama.trim() || !nim.trim() || !nilaiTB1 || !nilaiTB2 || !nilaiUAS) {
      Alert.alert('Error', 'Semua field harus diisi!');
      return false;
    }

    const tb1 = parseFloat(nilaiTB1);
    const tb2 = parseFloat(nilaiTB2);
    const uas = parseFloat(nilaiUAS);

    if (isNaN(tb1) || isNaN(tb2) || isNaN(uas)) {
      Alert.alert('Error', 'Nilai harus berupa angka yang valid!');
      return false;
    }

    if (tb1 < 0 || tb1 > 100 || tb2 < 0 || tb2 > 100 || uas < 0 || uas > 100) {
      Alert.alert('Error', 'Nilai harus antara 0-100!');
      return false;
    }

    return true;
  };

  const saveStudent = async (): Promise<void> => {
    if (!validateInput()) return;

    const tb1 = parseFloat(nilaiTB1);
    const tb2 = parseFloat(nilaiTB2);
    const uas = parseFloat(nilaiUAS);
    const nilaiAkhir = calculateFinalScore(tb1, tb2, uas);
    const grade = calculateGrade(nilaiAkhir);

    try {
      const database = await openDatabase();

      if (editMode && currentStudent) {
        // Update existing student
        await database.runAsync(
          `UPDATE students SET 
           nama = ?, nim = ?, mata_kuliah = ?, 
           nilai_tb1 = ?, nilai_tb2 = ?, nilai_uas = ?, 
           nilai_akhir = ?, grade = ? 
           WHERE id = ?`,
          [nama.trim(), nim.trim(), mataKuliah, tb1, tb2, uas, nilaiAkhir, grade, currentStudent.id]
        );
        Alert.alert('Sukses', 'Data mahasiswa berhasil diupdate!');
      } else {
        // Add new student
        await database.runAsync(
          `INSERT INTO students (nama, nim, mata_kuliah, nilai_tb1, nilai_tb2, nilai_uas, nilai_akhir, grade) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [nama.trim(), nim.trim(), mataKuliah, tb1, tb2, uas, nilaiAkhir, grade]
        );
        Alert.alert('Sukses', 'Data mahasiswa berhasil disimpan!');
      }

      await loadStudents();
      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving student:', error);
      Alert.alert('Error', 'Gagal menyimpan data mahasiswa!');
    }
  };

  const editStudent = (student: Student): void => {
    setCurrentStudent(student);
    setNama(student.nama);
    setNim(student.nim);
    setMataKuliah(student.mata_kuliah);
    setNilaiTB1(student.nilai_tb1.toString());
    setNilaiTB2(student.nilai_tb2.toString());
    setNilaiUAS(student.nilai_uas.toString());
    setEditMode(true);
    setModalVisible(true);
  };

  const deleteStudent = (id: number): void => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menghapus data ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const database = await openDatabase();
              await database.runAsync('DELETE FROM students WHERE id = ?', [id]);
              await loadStudents();
              Alert.alert('Sukses', 'Data berhasil dihapus!');
            } catch (error) {
              console.error('Error deleting student:', error);
              Alert.alert('Error', 'Gagal menghapus data!');
            }
          }
        }
      ]
    );
  };

  const resetForm = (): void => {
    setNama('');
    setNim('');
    setMataKuliah('Analisa Berorientasi Objek');
    setNilaiTB1('');
    setNilaiTB2('');
    setNilaiUAS('');
    setEditMode(false);
    setCurrentStudent(null);
  };

  const openAddModal = (): void => {
    resetForm();
    setModalVisible(true);
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return '#4CAF50';
      case 'B+': return '#8BC34A';
      case 'B': return '#CDDC39';
      case 'C+': return '#FF9800';
      case 'C': return '#FF5722';
      case 'D': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getGradeGradient = (grade: string): string[] => {
    switch (grade) {
      case 'A': return ['#4CAF50', '#66BB6A'];
      case 'B+': return ['#8BC34A', '#AED581'];
      case 'B': return ['#CDDC39', '#DCE775'];
      case 'C+': return ['#FF9800', '#FFB74D'];
      case 'C': return ['#FF5722', '#FF8A65'];
      case 'D': return ['#F44336', '#EF5350'];
      default: return ['#9E9E9E', '#BDBDBD'];
    }
  };

  const renderStudentItem = ({ item }: { item: Student }): React.JSX.Element => (
    <View style={styles.studentCard}>
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.cardGradient}
      >
        <View style={styles.studentHeader}>
          <View style={styles.studentNameContainer}>
            <Text style={styles.studentName}>{item.nama}</Text>
            <Text style={styles.studentNim}>NIM: {item.nim}</Text>
          </View>
          <LinearGradient
            colors={getGradeGradient(item.grade) as [string, string]}
            style={styles.gradeChip}
          >
            <Text style={styles.gradeText}>{item.grade}</Text>
          </LinearGradient>
        </View>

        <Text style={styles.courseText}>{item.mata_kuliah}</Text>

        <View style={styles.scoresContainer}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>TB1</Text>
            <Text style={styles.scoreValue}>{item.nilai_tb1}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>TB2</Text>
            <Text style={styles.scoreValue}>{item.nilai_tb2}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>UAS</Text>
            <Text style={styles.scoreValue}>{item.nilai_uas}</Text>
          </View>
        </View>

        <LinearGradient
          colors={['#2196F3', '#42A5F5']}
          style={styles.finalScoreContainer}
        >
          <Text style={styles.finalScoreText}>
            Nilai Akhir: {item.nilai_akhir.toFixed(2)}
          </Text>
        </LinearGradient>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => editStudent(item)}>
            <LinearGradient
              colors={['#FF9800', '#FFB74D']}
              style={styles.actionButton}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteStudent(item.id)}>
            <LinearGradient
              colors={['#F44336', '#EF5350']}
              style={styles.actionButton}
            >
              <Text style={styles.buttonText}>Hapus</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderEmptyComponent = (): React.JSX.Element => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#E3F2FD', '#BBDEFB']}
        style={styles.emptyGradient}
      >
        <Text style={styles.emptyText}>📚 Belum ada data mahasiswa</Text>
        <Text style={styles.emptySubText}>
          Tekan tombol "Tambah Data" untuk menambah data baru
        </Text>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#2196F3', '#21CBF3']} style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      <LinearGradient colors={['#2196F3', '#21CBF3']} style={styles.header}>
        <Text style={styles.headerTitle}>🎓 Sistem Nilai Mahasiswa</Text>
        <TouchableOpacity onPress={openAddModal}>
          <LinearGradient
            colors={['#ffffff', '#f5f5f5']}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Tambah Data</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={students}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            style={styles.modalContent}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <LinearGradient
                colors={['#2196F3', '#21CBF3']}
                style={styles.modalHeader}
              >
                <Text style={styles.modalTitle}>
                  {editMode ? '✏️ Edit Data Mahasiswa' : '➕ Tambah Data Mahasiswa'}
                </Text>
              </LinearGradient>

              <View style={styles.formContainer}>
                <Text style={styles.label}>Nama Mahasiswa</Text>
                <TextInput
                  style={styles.input}
                  value={nama}
                  onChangeText={setNama}
                  placeholder="Masukkan nama mahasiswa"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>NIM</Text>
                <TextInput
                  style={styles.input}
                  value={nim}
                  onChangeText={setNim}
                  placeholder="Masukkan NIM"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Mata Kuliah</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={mataKuliah}
                    onValueChange={setMataKuliah}
                    style={styles.picker}
                  >
                    {mataKuliahOptions.map((option) => (
                      <Picker.Item key={option} label={option} value={option} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Nilai TB1 (30%)</Text>
                <TextInput
                  style={styles.input}
                  value={nilaiTB1}
                  onChangeText={setNilaiTB1}
                  placeholder="Masukkan nilai TB1"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Nilai TB2 (30%)</Text>
                <TextInput
                  style={styles.input}
                  value={nilaiTB2}
                  onChangeText={setNilaiTB2}
                  placeholder="Masukkan nilai TB2"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Nilai UAS (40%)</Text>
                <TextInput
                  style={styles.input}
                  value={nilaiUAS}
                  onChangeText={setNilaiUAS}
                  placeholder="Masukkan nilai UAS"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <LinearGradient
                      colors={['#9E9E9E', '#BDBDBD']}
                      style={styles.modalButton}
                    >
                      <Text style={styles.buttonText}>Batal</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={saveStudent}>
                    <LinearGradient
                      colors={['#4CAF50', '#66BB6A']}
                      style={styles.modalButton}
                    >
                      <Text style={styles.buttonText}>
                        {editMode ? 'Update' : 'Simpan'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    paddingTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 2,
  },
  addButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    padding: 15,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyGradient: {
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    opacity: 0.8,
  },
  studentCard: {
    marginBottom: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 15,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  studentNameContainer: {
    flex: 1,
    marginRight: 10,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  studentNim: {
    fontSize: 14,
    color: '#666',
  },
  gradeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  gradeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  courseText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  scoreItem: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  finalScoreContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  finalScoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: 20,
    borderRadius: 20,
    maxHeight: '85%',
    width: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    marginTop: 5,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e3f2fd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#e3f2fd',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
  },
  modalButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
    elevation: 2,
  },
  });