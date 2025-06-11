document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const colorOptions = document.querySelectorAll('.color-option');
    const colorInput = document.getElementById('color');
    const thicknessSlider = document.getElementById('thickness');
    const thicknessValue = document.getElementById('thickness-value');
    const enabledCheckbox = document.getElementById('enabled');
    const smoothnessSlider = document.getElementById('smoothness');
    const smoothnessValue = document.getElementById('smoothness-value');

  
    // 从存储加载设置
    chrome.storage.sync.get(['trailColor', 'trailWidth', 'trailEnabled', 'trailSmoothness'], function(data) {
      const color = data.trailColor || '#ff0000';
      const width = data.trailWidth || 8;
      const enabled = data.trailEnabled !== undefined ? data.trailEnabled : true;
      const smoothness = data.trailSmoothness || 8;
      
      // 应用设置到UI
      colorInput.value = color;
      thicknessSlider.value = width;
      thicknessValue.textContent = width;
      enabledCheckbox.checked = enabled;
      smoothnessSlider.value = smoothness;
      smoothnessValue.textContent = smoothness;
  
      // 标记选中的颜色选项
      updateSelectedColor(color);

      // 显示设置页面
      document.querySelector('.container').style.visibility = 'visible';
    });
  
    // 预设颜色点击处理
    colorOptions.forEach(option => {
      option.addEventListener('click', function() {
        const color = this.getAttribute('data-color');
        colorInput.value = color;
        updateSelectedColor(color);
        saveSettings();
      });
    });
  
    // 颜色选择器变化处理
    colorInput.addEventListener('input', function() {
      updateSelectedColor(this.value);
      saveSettings();
    });
  
    // 滑块变化处理
    thicknessSlider.addEventListener('input', function() {
      thicknessValue.textContent = this.value;
      saveSettings();
    });
    
    smoothnessSlider.addEventListener('input', function () {
      smoothnessValue.textContent = this.value;
      saveSettings();
    });    

    // 开关变化处理
    enabledCheckbox.addEventListener('change', function() {
      saveSettings();
    });
  
    // 更新选中的颜色样式
    function updateSelectedColor(currentColor) {
      currentColor = currentColor.toLowerCase();
      colorOptions.forEach(option => {
        const optionColor = option.getAttribute('data-color').toLowerCase();
        if (optionColor === currentColor) {
          option.classList.add('selected');
        } else {
          option.classList.remove('selected');
        }
      });
    }
  
    // 保存设置到chrome.storage
    function saveSettings() {
      chrome.storage.sync.set({
        trailColor: colorInput.value,
        trailWidth: parseInt(thicknessSlider.value),
        trailEnabled: enabledCheckbox.checked,
        trailSmoothness: parseInt(smoothnessSlider.value)
      });
    }
  });