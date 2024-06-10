
document.addEventListener('DOMContentLoaded', function() {
    var viewModel = new JobViewModel();
    ko.applyBindings(viewModel);
    viewModel.fetchJobs();
});

function JobViewModel() {
    var self = this;
    self.jobs = ko.observableArray([]);
    console.log("HELLO")
    
        fetch('/api/job-status')
            .then(response => response.json())
            .then(data => {
                console.log(data)
                self.jobs(data.result); // Knockout.js observableArray update
            })
            .catch(error => console.error('Error fetching jobs:', error));

    self.stopJob = function(job) {
        // TODO: Implement stop functionality
        console.log("Stopping job", job.guid);
    };

    self.viewWorld = (job) => {
        window.location.href = '/world/index.html?socket=' + job.socket;
    }

    self.deleteJob = function(job) {
        if (confirm(`Are you sure you want to delete job ${job.guid}?`)) {
            fetch(`/api/delete-job/${job.guid}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    self.jobs.remove(job); // Remove the job from the observable array
                    console.log(`Job ${job.guid} deleted successfully`);
                } else {
                    console.error(`Error deleting job ${job.guid}: ${data.error}`);
                }
            })
            .catch(error => console.error('Error deleting job:', error));
        }
    };

    self.viewGraph = function(job) {
        window.location.href = `/digraph/index.html?guid=${job.guid}`;
    };

    self.downloadJob = function(job) {
        // TODO: Implement download functionality
        console.log("Downloading job", job.guid);
    };
}

// Activates knockout.js
ko.applyBindings(new JobViewModel());
