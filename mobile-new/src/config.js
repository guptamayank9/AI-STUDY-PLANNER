// ================================================================
// ⚠️  SIRF YAHI FILE EDIT KARO — BAAKI KUCH NAHI TODNA
// ================================================================
//
// Apna PC IP kaise pata karo:
//   Windows → CMD mein:   ipconfig
//             "IPv4 Address" wali line copy karo
//             Example:    192.168.1.47
//
//   Mac/Linux → Terminal:  ifconfig | grep "inet "
//
// Phone aur PC ek hi WiFi pe hone chahiye!
// ================================================================

const YOUR_PC_IP = "10.230.23.217"; // ← Tumhara IP

export const API_URL = `http://${YOUR_PC_IP}:5000/api`;
export const ML_URL  = `http://${YOUR_PC_IP}:8000`;
