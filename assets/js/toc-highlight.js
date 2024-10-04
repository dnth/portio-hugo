document.addEventListener('DOMContentLoaded', function() {
    const tocLinks = document.querySelectorAll('.floating-toc .toc-link');
    const sections = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    const floatingToc = document.getElementById('floating-toc');
    const tocHandle = document.getElementById('toc-handle');
    
    console.log('TOC Links:', tocLinks.length);
    console.log('Sections:', sections.length);

    function highlightTOC() {
      let scrollPosition = window.scrollY;
      console.log('Scroll position:', scrollPosition);
  
      sections.forEach(section => {
        if (section.offsetTop <= scrollPosition + 100) {
          console.log('Current section:', section.id);
          tocLinks.forEach(link => {
            if (link.getAttribute('href') === '#' + section.id) {
              console.log('Activating link:', link.getAttribute('href'));
              link.classList.add('active');
              link.style.backgroundColor = 'yellow'; // Add this line
            } else {
              link.classList.remove('active');
              link.style.backgroundColor = ''; // Add this line
            }
          });
        }
      });
    }
  
    window.addEventListener('scroll', highlightTOC);
    highlightTOC(); // Call once to set initial state

    // Improved draggable functionality
    let isDragging = false;
    let startX, startY;
    let startLeft, startTop;

    tocHandle.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);

    function startDrag(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = floatingToc.offsetLeft;
        startTop = floatingToc.offsetTop;
        
        // Improve performance during drag
        floatingToc.style.willChange = 'left, top';
    }

    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        floatingToc.style.left = `${startLeft + dx}px`;
        floatingToc.style.top = `${startTop + dy}px`;
    }

    function stopDrag() {
        isDragging = false;
        floatingToc.style.willChange = 'auto';
    }

    // Ensure TOC stays within viewport
    function constrainToBounds() {
        const rect = floatingToc.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        if (rect.left < 0) floatingToc.style.left = '0px';
        if (rect.top < 0) floatingToc.style.top = '0px';
        if (rect.left > maxX) floatingToc.style.left = `${maxX}px`;
        if (rect.top > maxY) floatingToc.style.top = `${maxY}px`;
    }

    window.addEventListener('resize', constrainToBounds);
    constrainToBounds(); // Initial call to set bounds
});