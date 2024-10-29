const { Reporter } = require('@playwright/test/reporter');
const fs = require('fs');
const path = require('path');

class CustomReporter extends Reporter {
  onTestBegin(test) {
    const testResultDir = path.join('test-results', test.title.replace(/[^a-zA-Z0-9]/g, '_'));
    if (!fs.existsSync(testResultDir)) {
      fs.mkdirSync(testResultDir, { recursive: true });
    }

    test.resultDir = testResultDir;
  }

  async onTestEnd(test, result) {
    if (result.status !== 'passed') {
      const { resultDir } = test;
      
      if (result.attachments.some(att => att.name === 'screenshot')) {
        await test.page.screenshot({ path: path.join(resultDir, 'screenshot.png') });
      }

      if (test.context) {
        const videoPath = await test.context.video().path();
        fs.copyFileSync(videoPath, path.join(resultDir, 'video.webm'));
      }
    }
  }

  async onEnd() {
    console.log('Custom reporter finished!');
  }
}

module.exports = CustomReporter;
