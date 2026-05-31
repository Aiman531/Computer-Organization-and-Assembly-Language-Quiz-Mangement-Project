// Global variables
let records = [];
let pieChart = null;
let barChart = null;
let recordsPieChart = null;
let recordsBarChart = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeFileUpload();
    initializeSearch();
    
    // Load records from localStorage if available
    const savedRecords = localStorage.getItem('quizRecords');
    if (savedRecords) {
        records = JSON.parse(savedRecords);
        if (document.getElementById('recordsBody')) {
            displayRecords(records);
        }
        if (document.getElementById('totalPlayers')) {
            updateDashboard();
        }
    }
});

// File Upload Handling
function initializeFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    if (!fileInput || !uploadArea) return;
    
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.txt')) {
            processFile(file);
        } else {
            alert('Please upload a .txt file (RECORD.TXT)');
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    });
}

// Process uploaded file
function processFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        console.log("File Content:", content);
        
        // Show file info
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        if (fileInfo && fileName) {
            fileName.textContent = file.name;
            fileInfo.classList.remove('d-none');
        }
        
        // Show debug panel
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            debugPanel.classList.remove('d-none');
            document.getElementById('debugFileContent').textContent = content;
        }
        
        parseRecords(content);
    };
    
    reader.onerror = function() {
        showError("Failed to read file. Please try again.");
    };
    
    reader.readAsText(file);
}

// Parse RECORD.TXT
function parseRecords(content) {
    records = [];
    const lines = content.split('\n');
    
    console.log("Lines:", lines);
    
    try {
        // Parse each line using "|" separator with labels
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // Skip empty lines
            if (!trimmedLine) {
                console.log(`Skipping empty line ${index}`);
                return;
            }
            
            console.log(`Parsing line ${index}:`, trimmedLine);
            
            // Split by "|" and handle extra spaces
            const parts = trimmedLine.split('|').map(part => part.trim());
            
            console.log(`Parts for line ${index}:`, parts);
            
            if (parts.length >= 3) {
                // Extract username from "Username: value"
                const usernameMatch = parts[0].match(/Username:\s*(.+)/i);
                const username = usernameMatch ? usernameMatch[1].trim() : '';
                
                // Extract category from "Category: value"
                const categoryMatch = parts[1].match(/Category:\s*(.+)/i);
                const category = categoryMatch ? categoryMatch[1].trim() : '';
                
                // Extract score from "Score: value"
                const scoreMatch = parts[2].match(/Score:\s*(.+)/i);
                const score = scoreMatch ? parseInt(scoreMatch[1].trim()) : 0;
                
                console.log(`Extracted - Username: ${username}, Category: ${category}, Score: ${score}`);
                
                if (username && category) {
                    const record = {
                        username: username,
                        category: category,
                        score: score
                    };
                    records.push(record);
                } else {
                    console.log(`Skipping invalid line ${index}: missing required fields`);
                }
            } else {
                console.log(`Skipping line ${index}: not enough parts (expected 3, got ${parts.length})`);
            }
        });
        
        console.log("Parsed Records:", records);
        
        // Update debug panel
        const debugFileStatus = document.getElementById('debugFileStatus');
        const debugRecordCount = document.getElementById('debugRecordCount');
        const debugParsedData = document.getElementById('debugParsedData');
        const debugError = document.getElementById('debugError');
        
        if (debugFileStatus) {
            debugFileStatus.textContent = 'Loaded Successfully';
            debugFileStatus.className = 'text-success ms-2';
        }
        
        if (debugRecordCount) {
            debugRecordCount.textContent = records.length;
        }
        
        if (debugParsedData) {
            debugParsedData.textContent = JSON.stringify(records, null, 2);
        }
        
        if (debugError) {
            debugError.classList.add('d-none');
        }
        
        // Check if any records were found
        if (records.length === 0) {
            showError("No valid records were found in RECORD.TXT. Please check the file format.");
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('quizRecords', JSON.stringify(records));
        
        // Display records
        if (document.getElementById('recordsBody')) {
            displayRecords(records);
            updateSummarySection();
            updateRecordsCharts();
        }
        
        // Update dashboard
        if (document.getElementById('totalPlayers')) {
            updateDashboard();
        }
        
    } catch (error) {
        console.error("Parsing error:", error);
        showError(`Parsing failed: ${error.message}`);
    }
}

// Display records in table
function displayRecords(data) {
    const tbody = document.getElementById('recordsBody');
    const noResults = document.getElementById('noResults');
    
    if (!tbody) return;
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-white-50 py-5">
                    <i class="fas fa-file-upload fa-2x mb-3"></i>
                    <p>No records found</p>
                </td>
            </tr>
        `;
        if (noResults) noResults.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = data.map((record, index) => `
        <tr class="fade-in" style="animation-delay: ${index * 0.05}s">
            <td><strong>${index + 1}</strong></td>
            <td><strong>${escapeHtml(record.username)}</strong></td>
            <td><span class="badge bg-primary">${escapeHtml(record.category)}</span></td>
            <td><span class="badge bg-${getScoreBadgeClass(record.score)}">${record.score}</span></td>
        </tr>
    `).join('');
    
    if (noResults) noResults.classList.add('d-none');
}

// Get badge class based on score (2=green, 1=yellow, 0=red)
function getScoreBadgeClass(score) {
    if (score === 2) return 'success';
    if (score === 1) return 'warning';
    return 'danger';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredRecords = records.filter(record => 
            record.username.toLowerCase().includes(searchTerm) ||
            record.category.toLowerCase().includes(searchTerm) ||
            record.score.toString().includes(searchTerm)
        );
        
        displayRecords(filteredRecords);
        
        // Show/hide no results message
        const noResults = document.getElementById('noResults');
        if (noResults) {
            if (filteredRecords.length === 0 && searchTerm !== '') {
                noResults.classList.remove('d-none');
            } else {
                noResults.classList.add('d-none');
            }
        }
    });
}

// Sort table
function sortTable(columnIndex) {
    const keys = ['username', 'category', 'score'];
    const key = keys[columnIndex];
    
    records.sort((a, b) => {
        if (typeof a[key] === 'number') {
            return b[key] - a[key];
        }
        return a[key].localeCompare(b[key]);
    });
    
    displayRecords(records);
}

// Update Dashboard
function updateDashboard() {
    if (records.length === 0) return;
    
    // Calculate statistics
    const totalPlayers = records.length;
    const scores = records.map(r => r.score);
    const highestScore = Math.max(...scores);
    const averageScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    
    // Find most popular category
    const categoryCount = {};
    records.forEach(r => {
        categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
    });
    
    const popularCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b
    );
    
    // Update stat cards with animation
    animateValue('totalPlayers', 0, totalPlayers, 1000);
    animateValue('highestScore', 0, highestScore, 1000);
    animateValue('averageScore', 0, averageScore, 1000);
    
    const popularCategoryEl = document.getElementById('popularCategory');
    if (popularCategoryEl) {
        popularCategoryEl.textContent = popularCategory;
    }
    
    // Update charts
    updatePieChart();
    updateBarChart(categoryCount);
    
    // Update recent activity
    updateRecentActivity();
}

// Animate value
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        if (current === end) {
            clearInterval(timer);
        }
    }, stepTime);
}

// Update Pie Chart
function updatePieChart() {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    // Group scores into ranges
    const scoreRanges = {
        'Excellent (80-100)': 0,
        'Good (60-79)': 0,
        'Average (40-59)': 0,
        'Needs Improvement (0-39)': 0
    };
    
    records.forEach(r => {
        if (r.score >= 80) scoreRanges['Excellent (80-100)']++;
        else if (r.score >= 60) scoreRanges['Good (60-79)']++;
        else if (r.score >= 40) scoreRanges['Average (40-59)']++;
        else scoreRanges['Needs Improvement (0-39)']++;
    });
    
    if (pieChart) {
        pieChart.destroy();
    }
    
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(scoreRanges),
            datasets: [{
                data: Object.values(scoreRanges),
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(234, 179, 8, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(234, 179, 8, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Update Bar Chart
function updateBarChart(categoryCount) {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;
    
    const categories = Object.keys(categoryCount);
    const counts = Object.values(categoryCount);
    
    // Calculate average score per category
    const categoryScores = {};
    records.forEach(r => {
        if (!categoryScores[r.category]) {
            categoryScores[r.category] = { total: 0, count: 0 };
        }
        categoryScores[r.category].total += r.score;
        categoryScores[r.category].count++;
    });
    
    const avgScores = categories.map(cat => 
        (categoryScores[cat].total / categoryScores[cat].count).toFixed(1)
    );
    
    if (barChart) {
        barChart.destroy();
    }
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Average Score',
                data: avgScores,
                backgroundColor: 'rgba(124, 58, 237, 0.8)',
                borderColor: 'rgba(124, 58, 237, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Update Recent Activity
function updateRecentActivity() {
    const tbody = document.getElementById('recentActivityBody');
    if (!tbody) return;
    
    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-white-50 py-4">
                    <p>No data available. Please upload RECORD.TXT on the Records page.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Get last 5 records
    const recentRecords = records.slice(-5).reverse();
    
    tbody.innerHTML = recentRecords.map((record, index) => `
        <tr class="fade-in" style="animation-delay: ${index * 0.1}s">
            <td><strong>${escapeHtml(record.username)}</strong></td>
            <td><span class="badge bg-primary">${escapeHtml(record.category)}</span></td>
            <td><span class="badge bg-${getScoreBadgeClass(record.score)}">${record.score}</span></td>
        </tr>
    `).join('');
}

// Show error message
function showError(message) {
    const debugError = document.getElementById('debugError');
    if (debugError) {
        debugError.textContent = message;
        debugError.classList.remove('d-none');
    }
    const debugFileStatus = document.getElementById('debugFileStatus');
    if (debugFileStatus) {
        debugFileStatus.textContent = 'Error';
        debugFileStatus.className = 'text-danger ms-2';
    }
    alert(message);
}

// Update Summary Section on Records Page
function updateSummarySection() {
    if (records.length === 0) return;
    
    const summarySection = document.getElementById('summarySection');
    if (!summarySection) return;
    
    summarySection.style.display = 'flex';
    
    // Calculate statistics
    const totalRecords = records.length;
    const scores = records.map(r => r.score);
    const highestScore = Math.max(...scores);
    const averageScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    
    // Find most popular category
    const categoryCount = {};
    records.forEach(r => {
        categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
    });
    
    const popularCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b
    );
    
    // Update summary cards
    document.getElementById('summaryTotalRecords').textContent = totalRecords;
    document.getElementById('summaryHighestScore').textContent = highestScore;
    document.getElementById('summaryAverageScore').textContent = averageScore;
    document.getElementById('summaryPopularCategory').textContent = popularCategory;
}

// Update Charts on Records Page
function updateRecordsCharts() {
    if (records.length === 0) return;
    
    const chartsSection = document.getElementById('chartsSection');
    if (!chartsSection) return;
    
    chartsSection.style.display = 'flex';
    
    // Category count for pie chart
    const categoryCount = {};
    records.forEach(r => {
        categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
    });
    
    // Score count for bar chart
    const scoreCount = { 'Perfect (2)': 0, 'Good (1)': 0, 'Low (0)': 0 };
    records.forEach(r => {
        if (r.score === 2) scoreCount['Perfect (2)']++;
        else if (r.score === 1) scoreCount['Good (1)']++;
        else scoreCount['Low (0)']++;
    });
    
    // Update Pie Chart (Categories)
    const pieCtx = document.getElementById('recordsPieChart');
    if (pieCtx) {
        if (recordsPieChart) {
            recordsPieChart.destroy();
        }
        
        recordsPieChart = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryCount),
                datasets: [{
                    data: Object.values(categoryCount),
                    backgroundColor: [
                        'rgba(124, 58, 237, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(234, 179, 8, 0.8)'
                    ],
                    borderColor: [
                        'rgba(124, 58, 237, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(6, 182, 212, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(234, 179, 8, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            padding: 15,
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }
    
    // Update Bar Chart (Scores)
    const barCtx = document.getElementById('recordsBarChart');
    if (barCtx) {
        if (recordsBarChart) {
            recordsBarChart.destroy();
        }
        
        recordsBarChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(scoreCount),
                datasets: [{
                    label: 'Count',
                    data: Object.values(scoreCount),
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(234, 179, 8, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(234, 179, 8, 1)',
                        'rgba(239, 68, 68, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#ffffff',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }
}
