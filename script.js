    // Paste your Google Sheets Web App URL here
    const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzH8TL29xMHAJ3LuwID751ifsOeS1wb7Bi28AtmHV1osLvxa9-SYFov5rGXET-zk_cvMw/exec";

    // State to store uploaded files as base64
    let uploadedImages = [];

    // Drag and Drop Logic
    const uploadZone = document.getElementById('upload-zone');
    
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadZone.addEventListener(eventName, e => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadZone.addEventListener(eventName, e => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
      }, false);
    });

    uploadZone.addEventListener('drop', e => {
      const dt = e.dataTransfer;
      const files = dt.files;
      processFiles(files);
    });

    function handleFileSelect(e) {
      const files = e.target.files;
      processFiles(files);
    }

    function processFiles(files) {
      Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
          alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          uploadedImages.push({
            filename: file.name,
            data: reader.result // Base64 string
          });
          renderPreviews();
        };
      });
    }

    function renderPreviews() {
      const container = document.getElementById('preview-container');
      container.innerHTML = '';
      
      uploadedImages.forEach((img, index) => {
        const card = document.createElement('div');
        card.className = 'preview-card';
        
        const elImage = document.createElement('img');
        elImage.src = img.data;
        card.appendChild(elImage);
        
        const btnRemove = document.createElement('button');
        btnRemove.type = 'button';
        btnRemove.className = 'preview-remove';
        btnRemove.innerHTML = '✕';
        btnRemove.onclick = (e) => {
          e.stopPropagation();
          uploadedImages.splice(index, 1);
          renderPreviews();
        };
        card.appendChild(btnRemove);
        
        container.appendChild(card);
      });
    }

    function handleCeremonyTypeChange(type) {
      const weddingRow = document.getElementById('wedding-names-row');
      const ordinationRow = document.getElementById('ordination-name-row');
      const nagName = document.getElementById('nag-name');

      if (type === 'wedding') {
        if (weddingRow) weddingRow.style.display = 'flex';
        if (ordinationRow) ordinationRow.style.display = 'none';
        if (nagName) nagName.required = false;
      } else if (type === 'ordination') {
        if (weddingRow) weddingRow.style.display = 'none';
        if (ordinationRow) ordinationRow.style.display = 'flex';
        if (nagName) nagName.required = true;
      } else {
        if (weddingRow) weddingRow.style.display = 'none';
        if (ordinationRow) ordinationRow.style.display = 'none';
        if (nagName) nagName.required = false;
      }
    }

    function handleQuantityChange(qty) {
      const val = parseInt(qty);
      const group2 = document.getElementById('color-group-2');
      const row2 = document.getElementById('color-row-2');
      const color2 = document.getElementById('color-2');
      const color3 = document.getElementById('color-3');

      if (val === 1) {
        if (group2) group2.style.display = 'none';
        if (row2) row2.style.display = 'none';
        if (color2) color2.required = false;
        if (color3) color3.required = false;
      } else if (val === 2) {
        if (group2) group2.style.display = 'block';
        if (row2) row2.style.display = 'none';
        if (color2) color2.required = true;
        if (color3) color3.required = false;
      } else if (val === 3) {
        if (group2) group2.style.display = 'block';
        if (row2) row2.style.display = 'block';
        if (color2) color2.required = true;
        if (color3) color3.required = true;
      }
    }

    // Submit Order Form
    async function submitForm(e) {
      e.preventDefault();
      
      if (uploadedImages.length === 0) {
        alert('กรุณาอัปโหลดรูปภาพแบบสั่งตัดอย่างน้อย 1 รูป');
        return;
      }

      // Alert to verify correctness
      if (!confirm('กรุณาตรวจสอบความถูกต้องของข้อมูลทั้งหมดก่อนส่งคำสั่งตัดโฟม\n\nกดยืนยันเพื่อดำเนินการส่งข้อมูล?')) {
        return;
      }

      if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL.includes("YOUR_GOOGLE_SHEET_WEB_APP_URL")) {
        alert('กรุณาตั้งค่า GOOGLE_SHEET_URL ที่ส่วนหัวของโค้ดสคริปต์ในไฟล์ index.html ก่อนใช้งาน');
        return;
      }

      const btnSubmit = document.getElementById('btn-submit');
      const btnSpinner = document.getElementById('btn-spinner');
      const btnText = document.getElementById('btn-text');

      // UI state loading
      btnSubmit.disabled = true;
      btnSpinner.style.display = 'inline-block';
      btnText.innerText = 'กำลังส่งข้อมูล...';

      const qty = parseInt(document.getElementById('quantity').value) || 1;
      let combinedColor = "";
      const c1 = document.getElementById('color').value;
      if (qty === 1) {
        combinedColor = c1;
      } else if (qty === 2) {
        const c2 = document.getElementById('color-2').value;
        combinedColor = `ชิ้นที่ 1: ${c1}, ชิ้นที่ 2: ${c2}`;
      } else if (qty === 3) {
        const c2 = document.getElementById('color-2').value;
        const c3 = document.getElementById('color-3').value;
        combinedColor = `ชิ้นที่ 1: ${c1}, ชิ้นที่ 2: ${c2}, ชิ้นที่ 3: ${c3}`;
      }

      const ceremonyType = document.getElementById('ceremony-type').value;
      let finalGroomName = "";
      let finalBrideName = "";

      if (ceremonyType === 'wedding') {
        finalGroomName = document.getElementById('groom-name').value;
        finalBrideName = document.getElementById('bride-name').value;
      } else if (ceremonyType === 'ordination') {
        finalGroomName = document.getElementById('nag-name').value;
        finalBrideName = "[งานบวช]";
      } // Else general leaves them empty

      const payload = {
        action: 'addOrder',
        customerName: document.getElementById('customer-name').value,
        groomName: finalGroomName,
        brideName: finalBrideName,
        requiredDate: document.getElementById('required-date').value,
        size: document.getElementById('size').value + " (จำนวน: " + qty + " ชิ้น)",
        color: combinedColor,
        notes: document.getElementById('notes').value,
        images: uploadedImages
      };

      try {
        const response = await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          body: JSON.stringify(payload),
          redirect: 'follow'
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success) {
            document.getElementById('success-overlay').classList.add('active');
          } else {
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + resJson.error);
          }
        } else {
          alert('เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets API');
        }
      } catch (err) {
        console.error(err);
        alert('ไม่สามารถเชื่อมต่อ Google Sheets Web App ได้ กรุณาตรวจสอบ URL หรือการเชื่อมต่ออินเทอร์เน็ต');
      } finally {
        btnSubmit.disabled = false;
        btnSpinner.style.display = 'none';
        btnText.innerText = 'ส่งข้อมูลสั่งตัด';
      }
    }

    // Reset Form for New Order
    function resetForm() {
      document.getElementById('order-form').reset();
      uploadedImages = [];
      document.getElementById('preview-container').innerHTML = '';
      document.getElementById('success-overlay').classList.remove('active');
      handleCeremonyTypeChange('wedding');
      handleQuantityChange(1);
    }

    async function fetchColors() {
      const selectors = document.querySelectorAll('.color-selector');
      if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL.includes("YOUR_GOOGLE_SHEET_WEB_APP_URL")) {
        selectors.forEach(select => {
          select.innerHTML = `
            <option value="" disabled selected>เลือกสีที่ต้องการ...</option>
            <option value="สีทองกากเพชร (ยอดนิยม)">สีทองกากเพชร (ยอดนิยม)</option>
            <option value="สีเงินกากเพชร">สีเงินกากเพชร</option>
            <option value="สีชมพูพาสเทล">สีชมพูพาสเทล</option>
            <option value="สีขาวโฟมธรรมชาติ">สีขาวโฟมธรรมชาติ</option>
            <option value="สีแดง">สีแดง</option>
            <option value="สีน้ำเงิน">สีน้ำเงิน</option>
            <option value="ระบุสีเพิ่มเติมในรายละเอียด">อื่นๆ (ระบุเพิ่มเติมในช่องหมายเหตุ)</option>
          `;
        });
        return;
      }

      try {
        const response = await fetch(GOOGLE_SHEET_URL + '?action=getColors', { redirect: 'follow' });
        if (response.ok) {
          const colors = await response.json();
          selectors.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="" disabled selected>เลือกสีที่ต้องการ...</option>';
            colors.forEach(c => {
              const opt = document.createElement('option');
              opt.value = c;
              opt.innerText = c;
              select.appendChild(opt);
            });
            const optOther = document.createElement('option');
            optOther.value = 'ระบุสีเพิ่มเติมในรายละเอียด';
            optOther.innerText = 'อื่นๆ (ระบุเพิ่มเติมในช่องหมายเหตุ)';
            select.appendChild(optOther);
            if (currentValue) select.value = currentValue;
          });
        }
      } catch (err) {
        console.error('Error fetching colors:', err);
      }
    }

    // Set minimum date in date picker to today
    window.addEventListener('DOMContentLoaded', () => {
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('required-date').setAttribute('min', today);
      fetchColors();
    });