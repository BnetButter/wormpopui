document.addEventListener('DOMContentLoaded', function() {
    fetchJobs();
});

function fetchJobs() {
    fetch('/api/job-status')
        .then(response => response.json())
        .then(data => {
            const jobs = data.result;
            updateJobsTable(jobs);
        })
        .catch(error => console.error('Error fetching jobs:', error));
}

function updateJobsTable(jobs) {
    const tbody = document.querySelector('table > tbody');
    tbody.innerHTML = ''; // Clear current rows

    jobs.forEach(job => {
        const row = tbody.insertRow();
        const idCell = row.insertCell();
        const nameCell = row.insertCell();
        const startTimeCell = row.insertCell();
        const timeElapsedCell = row.insertCell();
        const actionCell = row.insertCell();
        
        const trimmedGuid = job.guid.split('-').pop();

        idCell.textContent = trimmedGuid
        nameCell.textContent = job.name;
        startTimeCell.textContent = job.start_time;
        timeElapsedCell.textContent = job.time_elapsed;
        actionCell.innerHTML = `<button class="bg-red-500 hover:bg-red-700 text-white mx-3 font-bold py-1 px-2 rounded" data-job-id="${job.guid}">Stop</button>
                                <button class="bg-blue-500 hover:bg-blue-700 text-white mx-3 font-bold py-1 px-2 rounded" data-job-id="${job.guid}">Delete</button>`;
        
        // Create the anchor element
        const anchor = document.createElement('a');

        // Set the href attribute, incorporating job.guid
        anchor.href = `/digraph/index.html?guid=${job.guid}`;

        // Optionally set the anchor text or HTML
        anchor.textContent = 'View Graph'; // For text content
        // OR anchor.innerHTML = '<svg>...</svg>'; // If you're adding an icon or HTML

        // Append the anchor to the actionCell
        actionCell.appendChild(anchor);
    });


}
