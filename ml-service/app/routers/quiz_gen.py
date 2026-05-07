from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import os, json, re, random

router = APIRouter()

class QuizGenRequest(BaseModel):
    subject: str
    topic: Optional[str] = "General"
    difficulty: Optional[str] = "medium"
    num_questions: Optional[int] = 5

# ── Large Static Question Bank ─────────────────────────────────────────────
STATIC_BANK = {
    "Mathematics": [
        {"q": "What is the derivative of x³?", "options": ["3x²", "2x", "x³", "3x"], "answer": "3x²", "explanation": "Power rule: d/dx(xⁿ) = nxⁿ⁻¹"},
        {"q": "Value of ∫2x dx?", "options": ["x²+C", "2x²+C", "x+C", "2+C"], "answer": "x²+C", "explanation": "∫2x dx = 2·(x²/2) + C = x² + C"},
        {"q": "sin²θ + cos²θ = ?", "options": ["1", "0", "2", "sinθ"], "answer": "1", "explanation": "Fundamental Pythagorean identity"},
        {"q": "log(1) = ?", "options": ["0", "1", "-1", "undefined"], "answer": "0", "explanation": "log of 1 to any base is always 0"},
        {"q": "If f(x)=x²+3, f(2)=?", "options": ["7", "9", "5", "11"], "answer": "7", "explanation": "f(2) = 4+3 = 7"},
        {"q": "Roots of x²-5x+6=0?", "options": ["2,3", "1,6", "-2,-3", "3,4"], "answer": "2,3", "explanation": "(x-2)(x-3)=0"},
        {"q": "Area of circle with radius r?", "options": ["πr²", "2πr", "πr", "2πr²"], "answer": "πr²", "explanation": "Standard area formula A = πr²"},
        {"q": "What is the value of e (Euler's number) approximately?", "options": ["2.718", "3.14", "1.618", "2.303"], "answer": "2.718", "explanation": "e ≈ 2.71828, base of natural logarithm"},
        {"q": "Derivative of sin(x) is?", "options": ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"], "answer": "cos(x)", "explanation": "d/dx(sin x) = cos x"},
        {"q": "What is 0! (zero factorial)?", "options": ["1", "0", "undefined", "infinity"], "answer": "1", "explanation": "By definition, 0! = 1"},
        {"q": "What is the slope of y = 3x + 5?", "options": ["3", "5", "8", "15"], "answer": "3", "explanation": "In y = mx + c, m is the slope"},
        {"q": "∫cos(x) dx = ?", "options": ["sin(x)+C", "-sin(x)+C", "cos(x)+C", "tan(x)+C"], "answer": "sin(x)+C", "explanation": "Integral of cos(x) is sin(x) + C"},
        {"q": "Value of sin(0°)?", "options": ["0", "1", "-1", "0.5"], "answer": "0", "explanation": "sin(0°) = 0 by definition"},
        {"q": "What is √144?", "options": ["12", "14", "11", "13"], "answer": "12", "explanation": "12 × 12 = 144"},
        {"q": "Derivative of e^x is?", "options": ["e^x", "xe^x", "e^(x-1)", "1/e^x"], "answer": "e^x", "explanation": "e^x is its own derivative"},
    ],
    "Physics": [
        {"q": "F = ma. Unit of force?", "options": ["Newton", "Joule", "Pascal", "Watt"], "answer": "Newton", "explanation": "Newton = kg·m/s²"},
        {"q": "Speed of light in vacuum?", "options": ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], "answer": "3×10⁸ m/s", "explanation": "c ≈ 3×10⁸ m/s"},
        {"q": "KE = ?", "options": ["½mv²", "mv²", "mgh", "½mgh"], "answer": "½mv²", "explanation": "Kinetic energy = ½mv²"},
        {"q": "Ohm's law: V = ?", "options": ["IR", "I/R", "R/I", "I²R"], "answer": "IR", "explanation": "Voltage = Current × Resistance"},
        {"q": "Unit of electric charge?", "options": ["Coulomb", "Ampere", "Volt", "Watt"], "answer": "Coulomb", "explanation": "SI unit of charge is Coulomb (C)"},
        {"q": "Newton's 3rd law?", "options": ["Every action has equal opposite reaction", "F=ma", "Objects at rest stay at rest", "Energy is conserved"], "answer": "Every action has equal opposite reaction", "explanation": "Action-reaction pairs are equal and opposite"},
        {"q": "What is the unit of power?", "options": ["Watt", "Joule", "Newton", "Pascal"], "answer": "Watt", "explanation": "Power = Energy/Time, unit is Watt (W)"},
        {"q": "Acceleration due to gravity on Earth?", "options": ["9.8 m/s²", "8.9 m/s²", "10.8 m/s²", "9.0 m/s²"], "answer": "9.8 m/s²", "explanation": "g ≈ 9.8 m/s² on Earth's surface"},
        {"q": "What is the formula for potential energy?", "options": ["mgh", "½mv²", "mv", "F×d"], "answer": "mgh", "explanation": "PE = mass × gravity × height"},
        {"q": "Which law states PV = nRT?", "options": ["Ideal Gas Law", "Boyle's Law", "Charles's Law", "Newton's Law"], "answer": "Ideal Gas Law", "explanation": "PV = nRT is the Ideal Gas Law"},
        {"q": "Unit of frequency?", "options": ["Hertz", "Decibel", "Watt", "Joule"], "answer": "Hertz", "explanation": "Frequency is measured in Hertz (Hz) = cycles/second"},
        {"q": "What type of lens converges light?", "options": ["Convex", "Concave", "Plane", "Biconcave"], "answer": "Convex", "explanation": "Convex (converging) lenses focus light to a point"},
        {"q": "Which particle has no charge?", "options": ["Neutron", "Proton", "Electron", "Positron"], "answer": "Neutron", "explanation": "Neutrons are electrically neutral"},
        {"q": "What is the SI unit of pressure?", "options": ["Pascal", "Newton", "Bar", "Torr"], "answer": "Pascal", "explanation": "1 Pascal = 1 N/m²"},
        {"q": "Electromagnetic waves travel at?", "options": ["Speed of light", "Speed of sound", "Speed of electron", "Variable speed"], "answer": "Speed of light", "explanation": "All EM waves travel at c = 3×10⁸ m/s in vacuum"},
    ],
    "DSA": [
        {"q": "Time complexity of binary search?", "options": ["O(log n)", "O(n)", "O(n²)", "O(1)"], "answer": "O(log n)", "explanation": "Divides search space in half each step"},
        {"q": "Which uses LIFO order?", "options": ["Stack", "Queue", "Heap", "Tree"], "answer": "Stack", "explanation": "Last In First Out — Stack"},
        {"q": "Best case of bubble sort?", "options": ["O(n)", "O(n²)", "O(log n)", "O(n log n)"], "answer": "O(n)", "explanation": "Already sorted array needs only one pass"},
        {"q": "Hash table average lookup?", "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"], "answer": "O(1)", "explanation": "Direct key-index mapping gives constant time"},
        {"q": "DFS uses which data structure?", "options": ["Stack", "Queue", "Array", "Heap"], "answer": "Stack", "explanation": "DFS uses stack (or recursion which uses call stack)"},
        {"q": "Linked list vs Array — insertion at head?", "options": ["O(1) for linked list", "O(1) for array", "O(n) for both", "O(log n) for both"], "answer": "O(1) for linked list", "explanation": "Just update the head pointer — no shifting needed"},
        {"q": "What is a balanced BST?", "options": ["Height O(log n)", "Height O(n)", "All leaves same level", "Sorted array"], "answer": "Height O(log n)", "explanation": "Ensures O(log n) operations for search/insert/delete"},
        {"q": "BFS uses which data structure?", "options": ["Queue", "Stack", "Heap", "Tree"], "answer": "Queue", "explanation": "BFS explores level by level using a queue"},
        {"q": "Time complexity of merge sort?", "options": ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], "answer": "O(n log n)", "explanation": "Divide: O(log n) levels, Merge: O(n) each level"},
        {"q": "What is the space complexity of recursive DFS?", "options": ["O(h)", "O(n)", "O(1)", "O(n²)"], "answer": "O(h)", "explanation": "h = height of tree, due to call stack"},
        {"q": "Which sorting algorithm is stable?", "options": ["Merge Sort", "Quick Sort", "Heap Sort", "Selection Sort"], "answer": "Merge Sort", "explanation": "Merge sort preserves relative order of equal elements"},
        {"q": "What does a priority queue use internally?", "options": ["Heap", "Stack", "Linked List", "Array"], "answer": "Heap", "explanation": "Priority queue is typically implemented using a heap"},
        {"q": "Worst case of quick sort?", "options": ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], "answer": "O(n²)", "explanation": "When pivot is always smallest or largest element"},
        {"q": "What is dynamic programming?", "options": ["Memoization of overlapping subproblems", "Recursion only", "Greedy approach", "Divide and conquer"], "answer": "Memoization of overlapping subproblems", "explanation": "DP solves each subproblem once and stores results"},
        {"q": "In a min-heap, the root contains?", "options": ["Minimum element", "Maximum element", "Median", "Random element"], "answer": "Minimum element", "explanation": "Min-heap property: parent ≤ children, root is minimum"},
    ],
    "DBMS": [
        {"q": "ACID stands for?", "options": ["Atomicity Consistency Isolation Durability", "Access Control Index Data", "Async Concurrent Indexed Database", "None of these"], "answer": "Atomicity Consistency Isolation Durability", "explanation": "ACID properties ensure reliable database transactions"},
        {"q": "SQL SELECT syntax?", "options": ["SELECT col FROM table", "GET col FROM table", "FETCH col IN table", "READ col FROM table"], "answer": "SELECT col FROM table", "explanation": "Basic SQL query structure"},
        {"q": "Primary key property?", "options": ["Unique + Not Null", "Unique only", "Not Null only", "Can be duplicate"], "answer": "Unique + Not Null", "explanation": "Primary key must be unique and cannot be null"},
        {"q": "JOIN that returns all rows from left table?", "options": ["LEFT JOIN", "INNER JOIN", "RIGHT JOIN", "FULL JOIN"], "answer": "LEFT JOIN", "explanation": "LEFT JOIN keeps all left table rows, NULLs for unmatched right"},
        {"q": "Normal form that removes partial dependency?", "options": ["2NF", "1NF", "3NF", "BCNF"], "answer": "2NF", "explanation": "2NF eliminates partial dependencies on composite keys"},
        {"q": "What is a foreign key?", "options": ["References primary key of another table", "Unique key in same table", "Key with NULL values", "Auto-incremented key"], "answer": "References primary key of another table", "explanation": "Foreign key establishes referential integrity between tables"},
        {"q": "What does DDL stand for?", "options": ["Data Definition Language", "Data Display Language", "Dynamic Data Language", "Database Design Language"], "answer": "Data Definition Language", "explanation": "DDL includes CREATE, ALTER, DROP statements"},
        {"q": "Which SQL clause filters groups?", "options": ["HAVING", "WHERE", "GROUP BY", "ORDER BY"], "answer": "HAVING", "explanation": "HAVING filters after GROUP BY, WHERE filters before grouping"},
        {"q": "What is indexing in DBMS?", "options": ["Speed up data retrieval", "Add new records", "Delete duplicate rows", "Backup data"], "answer": "Speed up data retrieval", "explanation": "Index allows faster search without full table scan"},
        {"q": "What is a view in SQL?", "options": ["Virtual table from a query", "Physical table copy", "Stored procedure", "Database backup"], "answer": "Virtual table from a query", "explanation": "View is a saved query that acts like a table"},
        {"q": "Which command removes all rows but keeps table?", "options": ["TRUNCATE", "DELETE", "DROP", "REMOVE"], "answer": "TRUNCATE", "explanation": "TRUNCATE removes all rows faster than DELETE, keeps structure"},
        {"q": "What is a deadlock in DBMS?", "options": ["Two transactions waiting for each other", "Slow query performance", "Data corruption", "Connection timeout"], "answer": "Two transactions waiting for each other", "explanation": "Deadlock: T1 waits for T2's lock, T2 waits for T1's lock"},
        {"q": "3NF removes?", "options": ["Transitive dependency", "Partial dependency", "Multivalued dependency", "Join dependency"], "answer": "Transitive dependency", "explanation": "Third Normal Form eliminates transitive functional dependencies"},
        {"q": "What does COMMIT do in SQL?", "options": ["Saves transaction permanently", "Undoes all changes", "Locks the table", "Creates a backup"], "answer": "Saves transaction permanently", "explanation": "COMMIT makes all changes in the transaction permanent"},
        {"q": "Which join returns rows with matches in BOTH tables?", "options": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"], "answer": "INNER JOIN", "explanation": "INNER JOIN returns only the matching rows from both tables"},
    ],
    "OS": [
        {"q": "Deadlock requires?", "options": ["Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait", "Only Circular Wait", "Only Mutual Exclusion", "Starvation only"], "answer": "Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait", "explanation": "All 4 Coffman conditions must hold simultaneously"},
        {"q": "Optimal page replacement replaces?", "options": ["Page used farthest in future", "Least recently used", "First loaded page", "Most frequently used"], "answer": "Page used farthest in future", "explanation": "OPT algorithm gives lowest page fault rate theoretically"},
        {"q": "Process vs Thread — memory?", "options": ["Thread shares memory, process doesn't", "Process shares memory, thread doesn't", "Both share memory", "Neither shares memory"], "answer": "Thread shares memory, process doesn't", "explanation": "Threads share heap/code, each process has its own address space"},
        {"q": "CPU scheduling: shortest job first?", "options": ["SJF", "FCFS", "Round Robin", "Priority"], "answer": "SJF", "explanation": "Shortest Job First minimizes average waiting time"},
        {"q": "What is thrashing?", "options": ["Excessive paging causing low CPU utilization", "High CPU usage", "Memory overflow", "Process starvation"], "answer": "Excessive paging causing low CPU utilization", "explanation": "Thrashing: too many page faults, CPU spends time swapping"},
        {"q": "Which is a non-preemptive scheduling algorithm?", "options": ["FCFS", "Round Robin", "SRTF", "Multilevel Queue"], "answer": "FCFS", "explanation": "FCFS (First Come First Serve) is non-preemptive"},
        {"q": "What is a semaphore?", "options": ["Synchronization tool", "Memory manager", "CPU scheduler", "File system"], "answer": "Synchronization tool", "explanation": "Semaphore controls access to shared resources"},
        {"q": "Virtual memory allows?", "options": ["Running programs larger than RAM", "Faster CPU speed", "More cores", "Better graphics"], "answer": "Running programs larger than RAM", "explanation": "Virtual memory uses disk as extension of RAM"},
        {"q": "What is the purpose of the PCB?", "options": ["Store process information", "Manage memory", "Schedule CPU", "Handle I/O"], "answer": "Store process information", "explanation": "Process Control Block stores all info about a process"},
        {"q": "Which page replacement has the lowest page fault rate theoretically?", "options": ["Optimal (OPT)", "LRU", "FIFO", "Clock"], "answer": "Optimal (OPT)", "explanation": "OPT is theoretically best but not implementable in practice"},
        {"q": "What is context switching?", "options": ["Saving and loading process state", "Switching between users", "Changing CPU frequency", "Swapping memory pages"], "answer": "Saving and loading process state", "explanation": "OS saves current process state and loads next process state"},
        {"q": "Which state does a process move to when waiting for I/O?", "options": ["Blocked/Waiting", "Running", "Ready", "Terminated"], "answer": "Blocked/Waiting", "explanation": "Process waits for I/O completion in blocked state"},
        {"q": "What is the function of the MMU?", "options": ["Translates virtual to physical address", "Manages CPU scheduling", "Handles interrupts", "Controls disk access"], "answer": "Translates virtual to physical address", "explanation": "Memory Management Unit translates virtual addresses at runtime"},
        {"q": "Internal fragmentation occurs in?", "options": ["Fixed partitioning", "Dynamic partitioning", "Paging only", "Segmentation only"], "answer": "Fixed partitioning", "explanation": "Fixed partitions waste space when process is smaller than partition"},
        {"q": "What does the OS kernel run in?", "options": ["Privileged/kernel mode", "User mode", "Virtual mode", "Safe mode"], "answer": "Privileged/kernel mode", "explanation": "Kernel has full hardware access in privileged mode"},
    ],
    "CN": [
        {"q": "OSI model has how many layers?", "options": ["7", "4", "5", "6"], "answer": "7", "explanation": "Physical, Data Link, Network, Transport, Session, Presentation, Application"},
        {"q": "TCP vs UDP — which is reliable?", "options": ["TCP", "UDP", "Both", "Neither"], "answer": "TCP", "explanation": "TCP has handshake, acknowledgement, and retransmission"},
        {"q": "IPv4 address is how many bits?", "options": ["32", "64", "128", "16"], "answer": "32", "explanation": "IPv4 = 32 bits = 4 octets (e.g., 192.168.1.1)"},
        {"q": "DNS full form?", "options": ["Domain Name System", "Data Network Service", "Dynamic Name Server", "Direct Network System"], "answer": "Domain Name System", "explanation": "DNS translates domain names to IP addresses"},
        {"q": "HTTP default port?", "options": ["80", "443", "21", "22"], "answer": "80", "explanation": "HTTP uses port 80, HTTPS uses 443"},
        {"q": "Which layer handles routing?", "options": ["Network layer", "Transport layer", "Data Link layer", "Session layer"], "answer": "Network layer", "explanation": "Layer 3 (Network) handles IP routing between networks"},
        {"q": "What does ARP stand for?", "options": ["Address Resolution Protocol", "Application Router Protocol", "Automated Routing Process", "Access Route Protocol"], "answer": "Address Resolution Protocol", "explanation": "ARP maps IP addresses to MAC addresses"},
        {"q": "TCP 3-way handshake steps?", "options": ["SYN, SYN-ACK, ACK", "ACK, SYN, FIN", "SYN, ACK, FIN", "CONNECT, ACCEPT, OK"], "answer": "SYN, SYN-ACK, ACK", "explanation": "SYN→SYN-ACK→ACK establishes TCP connection"},
        {"q": "Which protocol is used for email sending?", "options": ["SMTP", "POP3", "IMAP", "FTP"], "answer": "SMTP", "explanation": "Simple Mail Transfer Protocol sends emails"},
        {"q": "What is the purpose of subnet mask?", "options": ["Identify network and host portions of IP", "Encrypt data", "Assign IP addresses", "Route packets"], "answer": "Identify network and host portions of IP", "explanation": "Subnet mask separates network ID from host ID"},
        {"q": "Which layer is responsible for encryption in OSI?", "options": ["Presentation layer", "Application layer", "Session layer", "Transport layer"], "answer": "Presentation layer", "explanation": "Layer 6 handles encryption, compression, and translation"},
        {"q": "What is a MAC address?", "options": ["Hardware address of network interface", "IP address type", "Software address", "Logical network address"], "answer": "Hardware address of network interface", "explanation": "MAC is a 48-bit physical address burned into NIC"},
        {"q": "HTTPS uses which port?", "options": ["443", "80", "8080", "21"], "answer": "443", "explanation": "HTTPS (HTTP Secure) uses port 443 with SSL/TLS"},
        {"q": "What is the purpose of DHCP?", "options": ["Automatically assigns IP addresses", "Translates domain names", "Encrypts network traffic", "Routes packets"], "answer": "Automatically assigns IP addresses", "explanation": "DHCP dynamically assigns IP config to network devices"},
        {"q": "Which protocol is connection-less?", "options": ["UDP", "TCP", "HTTP", "FTP"], "answer": "UDP", "explanation": "UDP is connectionless — no handshake, no guarantee of delivery"},
    ],
    "Chemistry": [
        {"q": "Atomic number of Carbon?", "options": ["6", "8", "12", "14"], "answer": "6", "explanation": "Carbon has 6 protons, atomic number = 6"},
        {"q": "Chemical formula of water?", "options": ["H₂O", "H₂O₂", "HO", "H₃O"], "answer": "H₂O", "explanation": "Water has 2 hydrogen and 1 oxygen atom"},
        {"q": "pH of neutral solution?", "options": ["7", "0", "14", "6"], "answer": "7", "explanation": "pH 7 is neutral, below 7 is acidic, above 7 is basic"},
        {"q": "What is the valency of Oxygen?", "options": ["2", "1", "3", "4"], "answer": "2", "explanation": "Oxygen has 2 electrons in its outermost shell needing 2 more"},
        {"q": "Which gas is released during photosynthesis?", "options": ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], "answer": "Oxygen", "explanation": "Plants release O₂ as a byproduct of photosynthesis"},
        {"q": "Chemical formula of table salt?", "options": ["NaCl", "KCl", "NaOH", "HCl"], "answer": "NaCl", "explanation": "Sodium Chloride (NaCl) is common table salt"},
        {"q": "What is an isotope?", "options": ["Same element different neutrons", "Different elements same mass", "Same element different protons", "Different elements same electrons"], "answer": "Same element different neutrons", "explanation": "Isotopes have same atomic number but different mass numbers"},
        {"q": "Avogadro's number is?", "options": ["6.022×10²³", "6.022×10²²", "6.022×10²⁴", "3.14×10²³"], "answer": "6.022×10²³", "explanation": "One mole of any substance contains 6.022×10²³ particles"},
        {"q": "Which acid is present in vinegar?", "options": ["Acetic acid", "Hydrochloric acid", "Citric acid", "Sulfuric acid"], "answer": "Acetic acid", "explanation": "Vinegar contains 5-8% acetic acid (CH₃COOH)"},
        {"q": "What is the chemical formula of glucose?", "options": ["C₆H₁₂O₆", "C₁₂H₂₂O₁₁", "C₆H₆", "CH₄"], "answer": "C₆H₁₂O₆", "explanation": "Glucose is a simple sugar with formula C₆H₁₂O₆"},
        {"q": "Which element is the most abundant in Earth's crust?", "options": ["Oxygen", "Silicon", "Iron", "Carbon"], "answer": "Oxygen", "explanation": "Oxygen makes up ~46% of Earth's crust by mass"},
        {"q": "What is a catalyst?", "options": ["Speeds up reaction without being consumed", "Slows down reaction", "Is consumed in the reaction", "Produces heat"], "answer": "Speeds up reaction without being consumed", "explanation": "Catalyst lowers activation energy and is not consumed"},
        {"q": "Atomic mass of Hydrogen?", "options": ["1", "2", "4", "0"], "answer": "1", "explanation": "Hydrogen has 1 proton, atomic mass ≈ 1 amu"},
        {"q": "What type of bond is in NaCl?", "options": ["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"], "answer": "Ionic bond", "explanation": "Na⁺ and Cl⁻ are held together by electrostatic attraction"},
        {"q": "Chemical formula of carbon dioxide?", "options": ["CO₂", "CO", "C₂O", "CO₃"], "answer": "CO₂", "explanation": "Carbon dioxide has 1 carbon and 2 oxygen atoms"},
    ],
    "Biology": [
        {"q": "DNA stands for?", "options": ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Deoxyribose Nucleic Acid", "Double Nucleic Acid"], "answer": "Deoxyribonucleic Acid", "explanation": "DNA carries genetic information in all living organisms"},
        {"q": "Powerhouse of the cell?", "options": ["Mitochondria", "Nucleus", "Ribosome", "Golgi Body"], "answer": "Mitochondria", "explanation": "Mitochondria produces ATP through cellular respiration"},
        {"q": "Human body has how many chromosomes?", "options": ["46", "23", "48", "44"], "answer": "46", "explanation": "Humans have 46 chromosomes in 23 pairs"},
        {"q": "Photosynthesis occurs in?", "options": ["Chloroplast", "Mitochondria", "Nucleus", "Ribosome"], "answer": "Chloroplast", "explanation": "Chloroplasts contain chlorophyll for photosynthesis"},
        {"q": "Which blood group is universal donor?", "options": ["O negative", "AB positive", "A positive", "B negative"], "answer": "O negative", "explanation": "O- has no antigens and no Rh factor — compatible with all blood types"},
        {"q": "What is osmosis?", "options": ["Movement of water through semipermeable membrane", "Movement of solutes", "Active transport", "Diffusion of gases"], "answer": "Movement of water through semipermeable membrane", "explanation": "Osmosis: water moves from low to high solute concentration"},
        {"q": "Which organ produces insulin?", "options": ["Pancreas", "Liver", "Kidney", "Stomach"], "answer": "Pancreas", "explanation": "Beta cells in pancreas produce insulin to regulate blood sugar"},
        {"q": "Number of bones in adult human body?", "options": ["206", "210", "200", "212"], "answer": "206", "explanation": "Adults have 206 bones (newborns have ~270 which fuse over time)"},
        {"q": "What is the function of red blood cells?", "options": ["Transport oxygen", "Fight infection", "Clot blood", "Produce antibodies"], "answer": "Transport oxygen", "explanation": "RBCs contain hemoglobin which carries oxygen to tissues"},
        {"q": "Which vitamin is produced by sunlight?", "options": ["Vitamin D", "Vitamin A", "Vitamin C", "Vitamin B12"], "answer": "Vitamin D", "explanation": "UV rays trigger Vitamin D synthesis in skin"},
        {"q": "Cell membrane is made of?", "options": ["Phospholipid bilayer", "Protein only", "Cellulose", "Carbohydrates"], "answer": "Phospholipid bilayer", "explanation": "Phospholipid bilayer forms the basic structure of cell membrane"},
        {"q": "What is the basic unit of heredity?", "options": ["Gene", "Chromosome", "DNA", "Protein"], "answer": "Gene", "explanation": "Genes are segments of DNA that encode for specific proteins"},
        {"q": "Which process converts glucose to energy?", "options": ["Cellular respiration", "Photosynthesis", "Fermentation only", "Transpiration"], "answer": "Cellular respiration", "explanation": "C₆H₁₂O₆ + O₂ → CO₂ + H₂O + ATP (energy)"},
        {"q": "What is the function of the kidney?", "options": ["Filter blood and produce urine", "Pump blood", "Digest food", "Produce hormones"], "answer": "Filter blood and produce urine", "explanation": "Kidneys filter ~180L of blood daily, producing urine"},
        {"q": "Which is the largest cell in the human body?", "options": ["Ovum (egg cell)", "Neuron", "Red blood cell", "Muscle cell"], "answer": "Ovum (egg cell)", "explanation": "The female egg cell (ovum) is the largest human cell at ~0.1mm"},
    ],
}

def generate_with_openai(subject: str, topic: str, difficulty: str, n: int):
    """Generate fresh questions using OpenAI API."""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        prompt = f"""Generate exactly {n} multiple choice questions for:
Subject: {subject}, Topic: {topic}, Difficulty: {difficulty}

Return ONLY a JSON array with NO extra text or markdown:
[{{"q":"question","options":["A","B","C","D"],"answer":"correct option","explanation":"why correct"}}]"""

        res = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.7,
        )
        raw = res.choices[0].message.content
        raw = re.sub(r"```json|```", "", raw).strip()
        return json.loads(raw)
    except Exception as e:
        print(f"OpenAI quiz gen failed: {e}")
        return None

@router.post("/generate-quiz")
def generate_quiz(req: QuizGenRequest):
    # Try OpenAI first
    if os.getenv("OPENAI_API_KEY"):
        ai_questions = generate_with_openai(req.subject, req.topic, req.difficulty, req.num_questions)
        if ai_questions:
            return {"questions": ai_questions, "source": "ai-generated", "subject": req.subject, "topic": req.topic}

    # Fallback: static bank
    bank = STATIC_BANK.get(req.subject, STATIC_BANK.get("DSA", []))

    if not bank:
        return {"questions": [], "source": "static-bank", "subject": req.subject, "topic": req.topic}

    n = req.num_questions

    if len(bank) >= n:
        # Enough questions — random sample
        selected = random.sample(bank, n)
    else:
        # Not enough — use all + repeat some randomly to fill up
        selected = bank.copy()
        while len(selected) < n:
            selected.append(random.choice(bank))
        random.shuffle(selected)

    return {
        "questions": selected,
        "source": "static-bank",
        "subject": req.subject,
        "topic": req.topic,
    }
