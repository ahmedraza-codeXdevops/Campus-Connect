// ---------- Live preview binding ----------
const form = document.getElementById('postForm');

const fields = {
  title: document.getElementById('title'),
  category: document.getElementById('category'),
  company: document.getElementById('company'),
  description: document.getElementById('description'),
  lastDate: document.getElementById('lastDate'),
  postedBy: document.getElementById('postedBy'),
};

const preview = {
  title: document.getElementById('pTitle'),
  category: document.getElementById('pCategory'),
  company: document.getElementById('pCompany'),
  desc: document.getElementById('pDesc'),
  location: document.getElementById('pLocation'),
  deadline: document.getElementById('pDeadline'),
  postedBy: document.getElementById('pPostedBy'),
};

const charCount = document.getElementById('charCount');

fields.title.addEventListener('input', () => {
  preview.title.textContent = fields.title.value.trim() || 'Your opportunity title';
});

fields.category.addEventListener('change', () => {
  preview.category.textContent = fields.category.value || 'Category';
});

fields.company.addEventListener('input', () => {
  preview.company.textContent = fields.company.value.trim() || 'Company / organization';
});

fields.description.addEventListener('input', () => {
  const val = fields.description.value;
  charCount.textContent = val.length;
  preview.desc.textContent = val.trim() || 'Your description will appear here as you type it above.';
});

document.querySelectorAll('input[name="location"]').forEach(radio => {
  radio.addEventListener('change', () => {
    preview.location.innerHTML = '<i class="dot"></i>' + radio.value;
  });
});

fields.lastDate.addEventListener('input', () => {
  if (!fields.lastDate.value) {
    preview.deadline.textContent = 'Set a deadline';
    preview.deadline.classList.remove('urgent');
    return;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(fields.lastDate.value);
  const days = Math.ceil((target - today) / 86400000);

  if (days < 0) {
    preview.deadline.textContent = 'Deadline passed';
    preview.deadline.classList.add('urgent');
  } else if (days === 0) {
    preview.deadline.textContent = 'Closes today';
    preview.deadline.classList.add('urgent');
  } else {
    preview.deadline.textContent = days + ' day' + (days === 1 ? '' : 's') + ' left';
    preview.deadline.classList.toggle('urgent', days <= 3);
  }
});

fields.postedBy.addEventListener('input', () => {
  preview.postedBy.textContent = '— posted by ' + (fields.postedBy.value.trim() || 'you');
});

// ---------- File drop ----------
const filedrop = document.getElementById('filedrop');
const posterInput = document.getElementById('poster');
const fileLabel = document.getElementById('fileLabel');

posterInput.addEventListener('change', () => {
  fileLabel.textContent = posterInput.files.length
    ? posterInput.files[0].name
    : 'Drop a file here or click to browse';
});

['dragenter', 'dragover'].forEach(evt =>
  filedrop.addEventListener(evt, e => {
    e.preventDefault();
    filedrop.classList.add('drag');
  })
);
['dragleave', 'drop'].forEach(evt =>
  filedrop.addEventListener(evt, e => {
    e.preventDefault();
    filedrop.classList.remove('drag');
  })
);
filedrop.addEventListener('drop', e => {
  if (e.dataTransfer.files.length) {
    posterInput.files = e.dataTransfer.files;
    fileLabel.textContent = e.dataTransfer.files[0].name;
  }
});

// ---------- Submit ----------
const submitBtn = document.getElementById('submitBtn');
const stamp = document.getElementById('stamp');
const formMessage = document.getElementById('formMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Sending…';
  formMessage.textContent = '';
  formMessage.className = 'form-message';

  const data = new FormData(form);

  try {
    const res = await fetch('backend/submit_post.php', {
      method: 'POST',
      body: data,
    });
    const result = await res.json();

    if (result.success) {
      stamp.textContent = 'Sent!';
      stamp.classList.add('sent');
      formMessage.textContent = 'Submitted — it now shows as pending approval on the board.';
      formMessage.classList.add('ok');
      form.reset();
      charCount.textContent = '0';
      fileLabel.textContent = 'Drop a file here or click to browse';
    } else {
      throw new Error(result.message || 'Something went wrong. Please try again.');
    }
  } catch (err) {
    formMessage.textContent = err.message;
    formMessage.classList.add('err');
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Send for approval';
  }
});
