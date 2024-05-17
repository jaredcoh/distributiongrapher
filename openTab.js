document.addEventListener("DOMContentLoaded", function() {
    // Select all tab elements
    const meanStdTab = document.getElementById('meanStdTab');
    const dataPointsTab = document.getElementById('dataPointsTab');
    const copyPasteTab = document.getElementById('copyPasteTab');

    if (meanStdTab && meanStdTab.classList.contains('active')) {
        tabContent.innerHTML = '<iframe src="meanNstdTab.html" frameborder="0" width="100%" height="100%"></iframe>';
    }

    // Add click event listeners to each tab element
    meanStdTab.addEventListener('click', function() {
        // Load content from meanStdTab.html
        tabContent.innerHTML = '<iframe src="meanNstdTab.html" frameborder="0" width="100%" height="100%"></iframe>';
        // Remove 'active' class from all tabs
        meanStdTab.classList.add('active');
        dataPointsTab.classList.remove('active');
        copyPasteTab.classList.remove('active');
    });

    dataPointsTab.addEventListener('click', function() {
        // Load content from dataPointsTab.html
        tabContent.innerHTML = '<iframe src="dataPointsTab.html" frameborder="0" width="100%" height="100%"></iframe>';
        // Remove 'active' class from all tabs
        meanStdTab.classList.remove('active');
        dataPointsTab.classList.add('active');
        copyPasteTab.classList.remove('active');
    });

    copyPasteTab.addEventListener('click', function() {
        // Load content from copyPaste.html
        tabContent.innerHTML = '<iframe src="copyPaste.html" frameborder="0" width="100%" height="100%"></iframe>';
        // Remove 'active' class from all tabs
        meanStdTab.classList.remove('active');
        dataPointsTab.classList.remove('active');
        copyPasteTab.classList.add('active');
    });
});
