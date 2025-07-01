# SpineSurge
Spine Angle Measurement Tool
SpineSurge 🦴
A React-based medical imaging tool for spine analysis and angle measurements. SpineSurge provides an intuitive interface for healthcare professionals to measure Cobb angles and spinopelvic parameters from radiographic images.

🎯 Usage Guide
Getting Started
Upload an Image: Click the file upload button to select a radiographic image
Convert to Grayscale (Optional): Use the grayscale conversion for better contrast
Select Module: Choose between "Cobb Angle" or "Spinopelvic Parameters"
🚀 Features
📐 Cobb Angle Measurement
Interactive Line Drawing: Click to place points and draw measurement lines
Automatic Angle Calculation: Real-time calculation of acute angles between perpendicular lines
Custom Labeling: Add descriptive labels to your measurements (e.g., "Lumbosacral angle")
Visual Feedback: Clear visualization of perpendicular lines and angle arcs
Precise Geometry: Advanced mathematical algorithms for accurate angle computation
usage
Add a Label: Enter a descriptive name for your angle measurement
Click "Go": Confirm the label to enable drawing tools
Draw Line 1: Click "Draw Line 1" and place two points on the first vertebral endplate
Draw Line 2: Click "Draw Line 2" and place two points on the second vertebral endplate
View Results: The angle will be automatically calculated and displayed
🏥 Spinopelvic Parameters
Femoral Head Line: Mark femoral head points for pelvic tilt calculations
S1 Upper Endplate: Identify S1 vertebral endplate for sacral slope measurements
Multiple Parameters: Calculate PT (Pelvic Tilt), SS (Sacral Slope), and PI (Pelvic Incidence)
Reference Lines: Visual guides including vertical, horizontal, and perpendicular reference lines
Color-coded Measurements: Different colors for each parameter type
Usage
Mark Femoral Head: Click "Mark Femoral Head Line" and place two points on the femoral heads
Mark S1 Endplate: Click "Mark S1 Upper Endplate" and place two points on the S1 vertebral endplate
View Parameters: Three parameters will be calculated:
PT (Pelvic Tilt): Angle between vertical and femoral head center to S1 midpoint
SS (Sacral Slope): Angle between horizontal and S1 endplate
PI (Pelvic Incidence): Angle between perpendicular to S1 and femoral head center to S1 midpoint
🖼️ Image Processing
Image Upload: Support for various image formats
Grayscale Conversion: Convert images to grayscale for better analysis
Canvas Overlay: Interactive drawing canvas overlaid on medical images
Responsive Design: Adapts to different image sizes and screen resolutions
📦 Installation
Clone the repository

git clone <repository-url>
cd spinesurge
Install dependencies

npm install
Start the development server

npm start
Open your browser Navigate to http://localhost:3000

🔧 Available Scripts
npm start - Runs the app in development mode
npm test - Launches the test runner
npm run build - Builds the app for production
npm run eject - Ejects from Create React App (one-way operation)
🧮 Mathematical Implementation
Cobb Angle Calculation
Uses perpendicular lines from vertebral endplates
Calculates acute angles using vector mathematics
Implements intersection detection for optimal arc placement
Handles edge cases with fallback calculations
Spinopelvic Parameters
PT: Angle between vertical reference and femoral head to S1 vector
SS: Angle between horizontal reference and S1 endplate vector
PI: Angle between S1 perpendicular and femoral head to S1 vector
All angles are forced to acute values for clinical relevance
🖼️ Example Images
Cobb Angle Measurement
Cobb Angle Example

Description: The Cobb Angle is a standard measurement used to quantify the degree of spinal deformities, particularly scoliosis. In SpineSurge, you can interactively draw two lines along the vertebral endplates of interest. The application automatically constructs perpendiculars, finds their intersection, and calculates the acute angle between them. The result is visually overlaid on the image, with the angle value and any custom label you provide. This helps clinicians quickly and accurately assess spinal curvature.

Spinopelvic Parameters
Spinopelvic Example

Description: Spinopelvic parameters are critical for evaluating sagittal balance and pelvic orientation. In SpineSurge, you mark the femoral head centers and the S1 upper endplate. The app then calculates and displays three key parameters:

PT (Pelvic Tilt): The angle between the vertical and the line connecting the femoral head center to the midpoint of the S1 endplate.
SS (Sacral Slope): The angle between the horizontal and the S1 endplate.
PI (Pelvic Incidence): The angle between the perpendicular to the S1 endplate and the line connecting the femoral head center to the S1 midpoint.
These measurements are color-coded and visually annotated on the image, providing a clear and immediate understanding of pelvic and spinal alignment for clinical decision-making.

🚀 Future Enhancements
 Export measurements to PDF reports
 Batch processing for multiple images
 Integration with PACS systems
 Additional spine measurement tools
 Measurement history and comparison
 Advanced image preprocessing options
 Deep Learning Based Approaches
📁 Project Structure
spinesurge/
├── public/                 # Static assets
├── src/
│   ├── App.js             # Main application component
│   ├── App.css            # Application styles
│   ├── index.js           # Application entry point
│   └── Old files/         # Previous implementation versions
├── examples/              # Sample images for testing
├── package.json           # Dependencies and scripts
└── README.md             # This file
🛠️ Technology Stack
Frontend: React 19.1.0
Build Tool: Create React App
Canvas API: HTML5 Canvas for drawing and measurements
Testing: Jest with React Testing Library
Development: Modern JavaScript (ES6+)
🎨 UI/UX Features
Intuitive Interface: Clean, medical-grade design
Visual Feedback: Color-coded elements and active state indicators
Responsive Layout: Sidebar controls with main canvas area
Interactive Elements: Hover states and click feedback
Professional Styling: Medical application aesthetic
🔒 Privacy & Security
Client-side Processing: All image processing occurs locally
No Data Transmission: Images are not uploaded to external servers
Browser-based: No installation required beyond the web application
🤝 Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

⚠️ Medical Disclaimer
This tool is designed to assist healthcare professionals in spine analysis but should not replace clinical judgment. Always verify measurements and consult with qualified medical professionals for clinical decisions.

📞 Support
For technical support or feature requests, please open an issue in the repository.

SpineSurge - Precision spine analysis for modern healthcare professionals 🏥
