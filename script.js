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
            // Save customer name to localStorage for auto-fill and history tracking
            const customerNameVal = document.getElementById('customer-name').value.trim();
            localStorage.setItem('logo_foam_customer_name', customerNameVal);
            
            // Show history toggle button
            const historyToggle = document.getElementById('history-toggle-container');
            if (historyToggle) historyToggle.style.display = 'block';
            
            // Reload history if currently open
            const historySection = document.getElementById('history-section');
            if (historySection && historySection.style.display === 'block') {
              fetchOrderHistory();
            }

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

      // Auto-fill customer name if saved in localStorage
      const savedName = localStorage.getItem('logo_foam_customer_name');
      if (savedName) {
        const nameInput = document.getElementById('customer-name');
        if (nameInput) nameInput.value = savedName;
        
        const historyToggle = document.getElementById('history-toggle-container');
        if (historyToggle) historyToggle.style.display = 'block';
      } else {
        const historyToggle = document.getElementById('history-toggle-container');
        if (historyToggle) historyToggle.style.display = 'none';
      }
    });

    // Toggle Order History Display
    function toggleHistorySection() {
      const section = document.getElementById('history-section');
      const btn = document.getElementById('btn-history-toggle');
      if (section && btn) {
        if (section.style.display === 'none') {
          section.style.display = 'block';
          fetchOrderHistory();
          btn.innerText = "🙈 ซ่อนประวัติการสั่งตัด";
        } else {
          section.style.display = 'none';
          btn.innerText = "📜 ดูประวัติการสั่งตัดล่าสุดของคุณ";
        }
      }
    }

    // Fetch customer-specific order history
    async function fetchOrderHistory() {
      const savedName = localStorage.getItem('logo_foam_customer_name');
      if (!savedName) return;

      const container = document.getElementById('history-list');
      if (!container) return;
      
      container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; text-align: center; padding: 1.5rem 0;">กำลังดึงข้อมูลประวัติของคุณ...</div>';

      if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL.includes("YOUR_GOOGLE_SHEET_WEB_APP_URL")) {
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; text-align: center; padding: 1.5rem 0; color: #ef4444;">ไม่ได้ตั้งค่า Google Sheets Web App URL</div>';
        return;
      }

      try {
        const response = await fetch(GOOGLE_SHEET_URL + `?action=getCustomerOrders&customerName=${encodeURIComponent(savedName)}`, { redirect: 'follow' });
        if (response.ok) {
          const orders = await response.json();
          if (orders.length === 0) {
            container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; text-align: center; padding: 1.5rem 0;">ไม่พบประวัติการสั่งตัดชื่อนี้</div>';
            return;
          }
          
          // Sort by id descending (newest first)
          orders.sort((a, b) => b.id - a.id);
          
          container.innerHTML = '';
          orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'history-card';
            
            let statusClass = 'pending';
            if (order.status === 'กำลังผลิต') statusClass = 'progress';
            if (order.status === 'เสร็จสิ้นแล้ว') statusClass = 'completed';

            let detailsText = "";
            if (order.brideName === '[งานบวช]') {
              detailsText = `👶 งานบวช: นาค ${order.groomName || '-'}`;
            } else if (order.groomName || order.brideName) {
              detailsText = `🤵 ${order.groomName || '-'} & 👰 ${order.brideName || '-'}`;
            } else {
              detailsText = 'โลโก้ทั่วไป';
            }

            // Format date
            let displayDate = order.requiredDate || '-';
            if (displayDate.includes('T')) {
              displayDate = displayDate.split('T')[0];
            }
            if (displayDate.split('-').length === 3) {
              const parts = displayDate.split('-');
              displayDate = `${parts[2]}/${parts[1]}/${parseInt(parts[0]) + 543}`;
            }

            let imagesHtml = "";
            if (order.images && order.images.length > 0) {
              imagesHtml = '<div class="history-card-images">';
              order.images.forEach(imgUrl => {
                let directUrl = imgUrl;
                const match = imgUrl.match(/\/file\/d\/([^/]+)/) || imgUrl.match(/id=([^&]+)/);
                if (match && match[1]) {
                  directUrl = `https://lh3.googleusercontent.com/d/${match[1]}`;
                }
                imagesHtml += `<img src="${directUrl}" class="history-card-img" onclick="window.open('${directUrl}')" alt="รูปสั่งตัด">`;
              });
              imagesHtml += '</div>';
            }

            card.innerHTML = `
              <div class="history-card-header">
                <span class="history-card-id">#${order.id}</span>
                <span class="badge ${statusClass}">${order.status}</span>
              </div>
              <div class="history-card-grid">
                <div class="history-card-item">
                  <span class="history-card-label">รายละเอียด:</span>
                  <span class="history-card-val">${detailsText}</span>
                </div>
                <div class="history-card-item">
                  <span class="history-card-label">วันที่ใช้:</span>
                  <span class="history-card-val">${displayDate}</span>
                </div>
                <div class="history-card-item">
                  <span class="history-card-label">ขนาด:</span>
                  <span class="history-card-val">${order.size}</span>
                </div>
                <div class="history-card-item">
                  <span class="history-card-label">สี:</span>
                  <span class="history-card-val">${order.color}</span>
                </div>
                ${imagesHtml}
              </div>
            `;
            container.appendChild(card);
          });
        } else {
          container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; text-align: center; padding: 1.5rem 0; color: #ef4444;">ไม่สามารถดึงข้อมูลประวัติได้</div>';
        }
      } catch (err) {
        console.error(err);
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; text-align: center; padding: 1.5rem 0; color: #ef4444;">เกิดข้อผิดพลาดในการเชื่อมต่อคลาวด์</div>';
      }
    }