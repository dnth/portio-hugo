document.addEventListener('DOMContentLoaded', function() {
    const tocLinks = document.querySelectorAll('.floating-toc .toc-link');
    const sections = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    
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
});