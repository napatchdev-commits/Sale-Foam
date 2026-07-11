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
        card.style.position = 'relative';
        
        const elImage = document.createElement('img');
        elImage.src = img.data;
        card.appendChild(elImage);
        
        // Remove Image Button
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

        // Edit Image Button (Crop & Text)
        const btnEdit = document.createElement('button');
        btnEdit.type = 'button';
        btnEdit.className = 'preview-edit-btn';
        btnEdit.innerHTML = '✏️ แก้ไข';
        btnEdit.style.position = 'absolute';
        btnEdit.style.bottom = '5px';
        btnEdit.style.left = '5px';
        btnEdit.style.background = 'rgba(0, 0, 0, 0.7)';
        btnEdit.style.color = '#fff';
        btnEdit.style.border = 'none';
        btnEdit.style.borderRadius = '4px';
        btnEdit.style.padding = '2px 6px';
        btnEdit.style.fontSize = '11px';
        btnEdit.style.cursor = 'pointer';
        btnEdit.onclick = (e) => {
          e.stopPropagation();
          openImageEditor(index);
        };
        card.appendChild(btnEdit);
        
        container.appendChild(card);
      });
    }

    function handleCeremonyTypeChange(type) {
      const weddingSection = document.getElementById('wedding-names-section');
      const ordinationSection = document.getElementById('ordination-names-section');
      const nagName = document.getElementById('nag-name');
      const ordinationSymbol = document.getElementById('ordination-symbol');

      if (type === 'wedding') {
        if (weddingSection) weddingSection.style.display = 'block';
        if (ordinationSection) ordinationSection.style.display = 'none';
        if (nagName) nagName.required = false;
        if (ordinationSymbol) ordinationSymbol.required = false;
      } else if (type === 'ordination') {
        if (weddingSection) weddingSection.style.display = 'none';
        if (ordinationSection) ordinationSection.style.display = 'block';
        if (nagName) nagName.required = true;
        if (ordinationSymbol) ordinationSymbol.required = true;
      } else {
        if (weddingSection) weddingSection.style.display = 'none';
        if (ordinationSection) ordinationSection.style.display = 'none';
        if (nagName) nagName.required = false;
        if (ordinationSymbol) ordinationSymbol.required = false;
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

    let lastSubmissionSuccessful = false;

    // Submit Order Form
    async function submitForm(e) {
      e.preventDefault();
      
      if (uploadedImages.length === 0) {
        showStatusPopup(false, 'ข้อมูลไม่ครบถ้วน!', 'กรุณาอัปโหลดรูปภาพแบบสั่งตัดอย่างน้อย 1 รูป');
        return;
      }

      // Alert to verify correctness
      if (!confirm('กรุณาตรวจสอบความถูกต้องของข้อมูลทั้งหมดก่อนส่งคำสั่งตัดโฟม\n\nกดยืนยันเพื่อดำเนินการส่งข้อมูล?')) {
        return;
      }

      if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL.includes("YOUR_GOOGLE_SHEET_WEB_APP_URL")) {
        showStatusPopup(false, 'ระบบขัดข้อง!', 'กรุณาตั้งค่า GOOGLE_SHEET_URL ที่ส่วนหัวของโค้ดสคริปต์ในไฟล์ index.html ก่อนใช้งาน');
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
        const groomTh = document.getElementById('groom-name').value.trim();
        const brideTh = document.getElementById('bride-name').value.trim();
        const groomEn = document.getElementById('groom-name-en').value.trim();
        const brideEn = document.getElementById('bride-name-en').value.trim();
        
        finalGroomName = groomTh + (groomEn ? ` (${groomEn})` : "");
        finalBrideName = brideTh + (brideEn ? ` (${brideEn})` : "");
      } else if (ceremonyType === 'ordination') {
        const nagTh = document.getElementById('nag-name').value.trim();
        const nagNick = document.getElementById('nag-nickname').value.trim();
        
        finalGroomName = nagTh + (nagNick ? ` (ชื่อเล่น: ${nagNick})` : "");
        finalBrideName = "[งานบวช]";
      } // Else general leaves them empty

      // Format bracketed notes metadata prefix
      const material = document.getElementById('material-type').value;
      let prefix = `[วัสดุ: ${material}]`;
      if (ceremonyType === 'ordination') {
        const symbol = document.getElementById('ordination-symbol').value;
        if (symbol) {
          prefix += ` [สัญลักษณ์: ${symbol}]`;
        }
      }
      const rawNotes = document.getElementById('notes').value.trim();
      const finalNotes = prefix + (rawNotes ? " " + rawNotes : "");

      const payload = {
        action: 'addOrder',
        customerName: document.getElementById('customer-name').value,
        groomName: finalGroomName,
        brideName: finalBrideName,
        requiredDate: document.getElementById('required-date').value,
        size: document.getElementById('size').value + " (จำนวน: " + qty + " ชิ้น)",
        color: combinedColor,
        notes: finalNotes,
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

            lastSubmissionSuccessful = true;
            showStatusPopup(true, 'ส่งใบสั่งตัดสำเร็จ!', 'ได้รับข้อมูลของท่านเรียบร้อยแล้ว');
          } else {
            lastSubmissionSuccessful = false;
            showStatusPopup(false, 'ส่งข้อมูลไม่สำเร็จ!', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + resJson.error);
          }
        } else {
          lastSubmissionSuccessful = false;
          showStatusPopup(false, 'การเชื่อมต่อผิดพลาด!', 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets API');
        }
      } catch (err) {
        console.error(err);
        lastSubmissionSuccessful = false;
        showStatusPopup(false, 'การเชื่อมต่อล้มเหลว!', 'ไม่สามารถเชื่อมต่อ Google Sheets Web App ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
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
      
      const weddingSection = document.getElementById('wedding-names-section');
      const ordinationSection = document.getElementById('ordination-names-section');
      if (weddingSection) weddingSection.style.display = 'block';
      if (ordinationSection) ordinationSection.style.display = 'none';
      
      const nagName = document.getElementById('nag-name');
      const ordinationSymbol = document.getElementById('ordination-symbol');
      if (nagName) nagName.required = false;
      if (ordinationSymbol) ordinationSymbol.required = false;

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
      const savedName = localStorage.getItem('logo_foam_customer_name') || document.getElementById('customer-name').value.trim();
      
      const container = document.getElementById('history-list');
      if (!container) return;

      if (!savedName) {
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; text-align: center; padding: 1.5rem 0; color: #ef4444;">กรุณากรอกชื่อในช่อง "ชื่อผู้สั่งตัด" ด้านบนเพื่อดึงประวัติสั่งซื้อย้อนหลัง</div>';
        return;
      }
      
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

    // Image Editor State Variables
    let originalEditorImage = null;
    let editorImage = null;
    let editorCanvas = null;
    let editorCtx = null;
    let editingIndex = null;

    let textsOnCanvas = [];
    let activeTextIndex = -1;

    let isCropMode = false;
    let cropStart = { x: 0, y: 0 };
    let cropEnd = { x: 0, y: 0 };
    let isDrawingCropBox = false;

    // Open Image Editor Modal
    function openImageEditor(index) {
      editingIndex = index;
      const imgData = uploadedImages[index].data;
      
      editorCanvas = document.getElementById('editor-canvas');
      editorCtx = editorCanvas.getContext('2d');
      
      textsOnCanvas = [];
      isCropMode = false;
      isDrawingCropBox = false;
      document.getElementById('btn-editor-crop').innerText = "✂️ ลากคลุมแล้วกด ครอปภาพ";
      document.getElementById('btn-editor-crop').style.background = "#2563eb";
      
      const img = new Image();
      img.src = imgData;
      img.onload = () => {
        originalEditorImage = img;
        editorCanvas.width = img.naturalWidth;
        editorCanvas.height = img.naturalHeight;
        editorCtx.drawImage(img, 0, 0);
        
        editorImage = new Image();
        editorImage.src = imgData;
        
        document.getElementById('image-editor-modal').style.display = 'flex';
        setupCanvasListeners();
        drawCanvas();
      };
    }

    // Get adjusted mouse/touch coordinate scaled to natural image resolution
    function getMousePos(canvas, evt) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const clientX = (evt.touches && evt.touches.length > 0) ? evt.touches[0].clientX : evt.clientX;
      const clientY = (evt.touches && evt.touches.length > 0) ? evt.touches[0].clientY : evt.clientY;
      
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    // Setup drag and draw listeners
    function setupCanvasListeners() {
      const startInteraction = (e) => {
        const pos = getMousePos(editorCanvas, e);
        if (isCropMode) {
          isDrawingCropBox = true;
          cropStart = { ...pos };
          cropEnd = { ...pos };
        } else {
          activeTextIndex = -1;
          for (let i = textsOnCanvas.length - 1; i >= 0; i--) {
            const txt = textsOnCanvas[i];
            editorCtx.font = `${txt.size}px 'Inter', sans-serif`;
            const width = editorCtx.measureText(txt.text).width;
            const height = txt.size;
            
            if (pos.x >= txt.x && pos.x <= txt.x + width && pos.y >= txt.y && pos.y <= txt.y + height) {
              activeTextIndex = i;
              textsOnCanvas[i].isDragging = true;
              break;
            }
          }
        }
      };

      const moveInteraction = (e) => {
        const pos = getMousePos(editorCanvas, e);
        if (isCropMode && isDrawingCropBox) {
          e.preventDefault();
          cropEnd = { ...pos };
          drawCanvas();
        } else if (activeTextIndex !== -1) {
          e.preventDefault();
          textsOnCanvas[activeTextIndex].x = pos.x;
          textsOnCanvas[activeTextIndex].y = pos.y;
          drawCanvas();
        }
      };

      const endInteraction = (e) => {
        if (isCropMode && isDrawingCropBox) {
          isDrawingCropBox = false;
          drawCanvas();
        } else if (activeTextIndex !== -1) {
          textsOnCanvas[activeTextIndex].isDragging = false;
          activeTextIndex = -1;
        }
      };

      editorCanvas.onmousedown = startInteraction;
      editorCanvas.ontouchstart = startInteraction;
      
      editorCanvas.onmousemove = moveInteraction;
      editorCanvas.ontouchmove = moveInteraction;
      
      editorCanvas.onmouseup = endInteraction;
      editorCanvas.onmouseleave = endInteraction;
      editorCanvas.ontouchend = endInteraction;
    }

    // Render loop
    function drawCanvas() {
      if (!editorImage) return;
      editorCanvas.width = editorImage.naturalWidth;
      editorCanvas.height = editorImage.naturalHeight;
      editorCtx.drawImage(editorImage, 0, 0);
      
      textsOnCanvas.forEach((txt) => {
        editorCtx.font = `${txt.size}px 'Inter', sans-serif`;
        editorCtx.fillStyle = txt.color;
        editorCtx.textBaseline = 'top';
        
        editorCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        editorCtx.shadowBlur = 4;
        editorCtx.shadowOffsetX = 2;
        editorCtx.shadowOffsetY = 2;
        
        editorCtx.fillText(txt.text, txt.x, txt.y);
      });
      
      editorCtx.shadowBlur = 0;
      editorCtx.shadowColor = 'transparent';
      
      if (isCropMode && (isDrawingCropBox || (cropStart.x !== cropEnd.x))) {
        editorCtx.strokeStyle = '#2563eb';
        editorCtx.lineWidth = Math.max(3, editorCanvas.width / 200);
        editorCtx.strokeRect(cropStart.x, cropStart.y, cropEnd.x - cropStart.x, cropEnd.y - cropStart.y);
        
        editorCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        editorCtx.fillRect(0, 0, editorCanvas.width, Math.min(cropStart.y, cropEnd.y));
        editorCtx.fillRect(0, Math.max(cropStart.y, cropEnd.y), editorCanvas.width, editorCanvas.height - Math.max(cropStart.y, cropEnd.y));
        editorCtx.fillRect(0, Math.min(cropStart.y, cropEnd.y), Math.min(cropStart.x, cropEnd.x), Math.abs(cropEnd.y - cropStart.y));
        editorCtx.fillRect(Math.max(cropStart.x, cropEnd.x), Math.min(cropStart.y, cropEnd.y), editorCanvas.width - Math.max(cropStart.x, cropEnd.x), Math.abs(cropEnd.y - cropStart.y));
      }
    }

    // Add new text element on canvas
    function addTextToCanvas() {
      const input = document.getElementById('editor-text-input');
      const textVal = input.value.trim();
      if (!textVal) return;
      
      const color = document.getElementById('editor-text-color').value;
      const size = parseInt(document.getElementById('editor-text-size').value) || 28;
      
      const x = editorCanvas.width / 2 - 50;
      const y = editorCanvas.height / 2 - 15;
      
      textsOnCanvas.push({
        text: textVal,
        x: x,
        y: y,
        size: size,
        color: color,
        isDragging: false
      });
      
      input.value = '';
      drawCanvas();
    }

    // Toggle crop selection mode
    function startCropping() {
      if (!isCropMode) {
        isCropMode = true;
        document.getElementById('btn-editor-crop').innerText = "✅ ยืนยันการครอป";
        document.getElementById('btn-editor-crop').style.background = "#059669";
        cropStart = { x: 0, y: 0 };
        cropEnd = { x: 0, y: 0 };
        drawCanvas();
        alert("ลากเมาส์หรือทัชสกรีนบนรูปภาพเพื่อเลือกกรอบสีน้ำเงินที่ต้องการครอป จากนั้นกดปุ่ม 'ยืนยันการครอป' สีเขียวอีกครั้ง");
      } else {
        const x = Math.min(cropStart.x, cropEnd.x);
        const y = Math.min(cropStart.y, cropEnd.y);
        const w = Math.abs(cropEnd.x - cropStart.x);
        const h = Math.abs(cropEnd.y - cropStart.y);
        
        if (w < 15 || h < 15) {
          alert("กรุณาลากเส้นเลือกพื้นที่ที่จะครอปก่อนกดยืนยัน");
          return;
        }
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.drawImage(editorImage, x, y, w, h, 0, 0, w, h);
        
        const croppedData = tempCanvas.toDataURL('image/jpeg', 0.95);
        const newImg = new Image();
        newImg.src = croppedData;
        newImg.onload = () => {
          editorImage = newImg;
          
          textsOnCanvas.forEach(txt => {
            txt.x -= x;
            txt.y -= y;
          });
          
          isCropMode = false;
          document.getElementById('btn-editor-crop').innerText = "✂️ ลากคลุมแล้วกด ครอปภาพ";
          document.getElementById('btn-editor-crop').style.background = "#2563eb";
          drawCanvas();
        };
      }
    }

    // Reset to initial image upload state
    function resetEditorImage() {
      if (!confirm("ต้องการคืนค่ากลับไปใช้รูปภาพเริ่มต้นใช่หรือไม่?")) return;
      textsOnCanvas = [];
      isCropMode = false;
      isDrawingCropBox = false;
      document.getElementById('btn-editor-crop').innerText = "✂️ ลากคลุมแล้วกด ครอปภาพ";
      document.getElementById('btn-editor-crop').style.background = "#2563eb";
      
      editorImage = new Image();
      editorImage.src = originalEditorImage.src;
      editorImage.onload = () => {
        drawCanvas();
      };
    }

    // Save modifications back to global array
    function saveEditorImage() {
      isCropMode = false;
      drawCanvas();
      
      const finalData = editorCanvas.toDataURL('image/jpeg', 0.9);
      uploadedImages[editingIndex].data = finalData;
      renderPreviews();
      closeImageEditor();
    }

    // Close Modal
    function closeImageEditor() {
      document.getElementById('image-editor-modal').style.display = 'none';
      editingIndex = null;
      originalEditorImage = null;
      editorImage = null;
      editorCanvas = null;
      editorCtx = null;
    }

    // Status Popup Management
    function showStatusPopup(isSuccess, title, desc) {
      const popup = document.getElementById('status-popup');
      const content = document.getElementById('status-popup-content');
      const icon = document.getElementById('status-popup-icon');
      const titleEl = document.getElementById('status-popup-title');
      const descEl = document.getElementById('status-popup-desc');
      const btn = document.getElementById('status-popup-btn');
      
      if (isSuccess) {
        content.className = 'status-popup-content success';
        icon.innerText = '✨';
        titleEl.innerText = title || 'ส่งข้อมูลสั่งตัดสำเร็จ!';
        descEl.innerText = desc || 'ได้รับข้อมูลของท่านเรียบร้อยแล้ว';
        btn.innerText = 'ตกลง';
      } else {
        content.className = 'status-popup-content error';
        icon.innerText = '⚠️';
        titleEl.innerText = title || 'ส่งข้อมูลไม่สำเร็จ!';
        descEl.innerText = desc || 'กรุณาลองใหม่อีกครั้ง หรือติดต่อร้านค้า';
        btn.innerText = 'ปิด';
      }
      
      popup.style.display = 'flex';
    }

    function closeStatusPopup() {
      document.getElementById('status-popup').style.display = 'none';
      if (lastSubmissionSuccessful) {
        resetForm();
        lastSubmissionSuccessful = false;
      }
    }