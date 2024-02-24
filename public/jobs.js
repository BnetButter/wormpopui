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
    });
}
