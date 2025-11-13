# PostureAI - Intelligent Posture Monitoring Web Application

A modern, visually stunning web application for real-time posture detection using AI and computer vision. Built with Teachable Machine, TensorFlow.js, and modern web technologies.

## ✨ Features

### 🎯 Core Functionality
- **Real-time Posture Detection**: Uses your trained Teachable Machine pose model
- **Live Webcam Feed**: High-quality video stream with pose overlay
- **AI-Powered Analysis**: Continuous monitoring and classification
- **Visual Feedback**: Real-time posture status with color-coded indicators

### 📊 Analytics & Monitoring
- **Session Tracking**: Monitor duration and posture statistics
- **Posture History**: Visual timeline of your posture patterns
- **Performance Metrics**: Percentage of good posture during sessions
- **Eye Strain Monitoring**: Simulated blink rate detection

### 🎨 Modern Design
- **Glass Morphism UI**: Beautiful frosted glass effects
- **Animated Background**: Interactive Vanta.js birds animation
- **Responsive Design**: Works perfectly on desktop and mobile
- **Smooth Animations**: Enhanced user experience with CSS transitions

### 🚀 User Experience
- **Keyboard Shortcuts**: Ctrl+Space to start/stop, Ctrl+F for fullscreen
- **Notifications**: Smart alerts for posture reminders
- **Wellness Tips**: Integrated health recommendations
- **Fullscreen Mode**: Distraction-free monitoring

## 🛠️ Setup Instructions

### 1. Prepare Your Teachable Machine Model

1. Go to [Teachable Machine](https://teachablemachine.withgoogle.com/)
2. Create a new "Pose Project"
3. Train your model with different posture classes:
   - "Good Posture" (sitting/standing straight)
   - "Poor Posture" (slouching, hunched)
   - "Neutral Posture" (relaxed but acceptable)
4. Export your model and get the shareable link
5. Copy the model URL (it should look like: `https://teachablemachine.withgoogle.com/models/[YOUR-MODEL-ID]/`)

### 2. Update the Model URL

In `posture-app.js`, replace the default model URL with your own:

```javascript
// Line 13 in posture-app.js
this.MODEL_URL = "https://teachablemachine.withgoogle.com/models/YOUR-MODEL-ID/";
```

### 3. Run the Application

1. Ensure all files are in the same directory:
   - `index.html`
   - `posture-app.js`
   - `README.md`

2. Start a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js
   npx http-server
   ```

3. Open your browser and navigate to `http://localhost:8000`

4. Allow camera access when prompted

## 📱 Usage Guide

### Starting Monitoring
- Click the "Start" button or press `Ctrl+Space`
- Position yourself in front of the camera
- The AI will begin analyzing your posture in real-time

### Understanding the Interface

#### Live Analysis Section
- **Webcam Feed**: Shows your live video with pose skeleton overlay
- **Prediction Bars**: Real-time confidence levels for each posture class
- **Status Indicators**: Color-coded posture assessment

#### Dashboard Metrics
- **Posture Status**: Current posture classification (Good/Poor/Fair)
- **Eye Strain Risk**: Simulated blink rate monitoring
- **Session Stats**: Time elapsed and posture percentage
- **Posture Timeline**: Visual history of your posture patterns

#### Wellness Features
- **Health Tips**: Contextual recommendations for better posture
- **Exercise Suggestions**: Quick exercises to reduce strain
- **Break Reminders**: Smart notifications for posture breaks

### Keyboard Shortcuts
- `Ctrl+Space`: Start/Stop monitoring
- `Ctrl+F`: Toggle fullscreen mode
- `Escape`: Stop monitoring and exit fullscreen

## 🎯 Training Tips for Better Results

### Data Collection
1. **Diverse Examples**: Capture various angles and lighting conditions
2. **Consistent Classes**: Use clear, distinct posture categories
3. **Balanced Dataset**: Include similar numbers of examples for each class
4. **Real-world Scenarios**: Include common working positions

### Model Optimization
- **Good Posture Examples**: Sitting/standing straight, shoulders back, head aligned
- **Poor Posture Examples**: Slouching, forward head, hunched shoulders
- **Neutral Examples**: Relaxed but acceptable positions

## 🔧 Customization

### Styling
The application uses Tailwind CSS for styling. You can customize:
- Color schemes in the CSS variables
- Animation timing and effects
- Layout and spacing
- Glass morphism effects

### Features
You can easily add:
- Additional posture classes
- Custom notification sounds
- Export functionality for session data
- Integration with health apps

## 🌐 Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

**Requirements:**
- WebRTC support for camera access
- Modern JavaScript (ES6+)
- WebGL support for animations

## 🔒 Privacy & Security

- **Local Processing**: All AI inference happens in your browser
- **No Data Collection**: Your video feed is never transmitted
- **Offline Capable**: Works without internet connection after initial load
- **Secure**: Uses HTTPS and modern web security standards

## 🐛 Troubleshooting

### Common Issues

**Camera not working:**
- Check browser permissions
- Ensure no other apps are using the camera
- Try refreshing the page

**Model not loading:**
- Verify your Teachable Machine model URL
- Check internet connection
- Ensure CORS is properly configured

**Poor detection accuracy:**
- Improve lighting conditions
- Ensure clear view of your full body
- Retrain model with more diverse examples

**Performance issues:**
- Close other browser tabs
- Reduce video quality if needed
- Check system resources

## 📈 Future Enhancements

- **Voice Alerts**: Audio notifications for posture corrections
- **Data Export**: CSV/JSON export of session statistics
- **Multi-user Support**: Switch between different user profiles
- **Mobile App**: React Native version for mobile devices
- **Cloud Sync**: Optional data synchronization across devices

## 🤝 Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting features
- Improving documentation
- Submitting pull requests

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **TensorFlow.js**: For machine learning capabilities
- **Teachable Machine**: For easy model training
- **Vanta.js**: For beautiful background animations
- **Tailwind CSS**: For utility-first styling

---

**Enjoy using PostureAI!** 🎯✨

For support or questions, please open an issue in the project repository.