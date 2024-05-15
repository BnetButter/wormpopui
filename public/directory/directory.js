function SimulationInstance(guid, name) {
    const self = this;
    self.guid = guid
    self.name = name
    self.selected = ko.observable(false)
}

function TableModel(data, headers) {
    const self = this
    self.headers = headers
    self.rows = []

    console.log(self.headers[0])
    
    const numRows = data[self.headers[0]].length
    
    for (let i = 0; i < numRows; i++) {
        const row = []
        
        for (let col of self.headers) {
            const column = data[col]
            row.push(column[i])
        }
        self.rows.push(row)
    }
    console.log(self.rows)
}

function DirectoryModel() {
    const self = this

    self.allSimulationInstance = ko.observableArray([])
    self.selectedSimulation = ko.observable(null)

    self.sqlQuery = ko.observable("HGELLO")
    self.tableView = ko.observable(false)

    self.tableFields = ko.observableArray([])
    self.tableError = ko.observable("")

    self.rowsPerPage = ko.observable(50)
    self.pageNumber = ko.observable(1)

    
    // Load simulation instance
    fetch('/api/job-status')
        .then(response => response.json())
        .then(data => {
            const jobs = data.result
            self.allSimulationInstance(jobs.map(obj => new SimulationInstance(obj.guid, obj.name)))
        });
    
    self.userSelectedSimulation = (item) => {
        console.log(item)
        const isAlreadySelected = item.selected()
        self.allSimulationInstance().forEach((inst) => inst.selected(false))
        item.selected(!isAlreadySelected)

        if (item.selected()) {
            self.selectedSimulation(item)
        }
        else {
            self.selectedSimulation(null)
        }
    }

    self.pageLeft = () => {
        const pageNum = self.pageNumber()
        self.pageNumber(pageNum > 1 ? pageNum - 1 : pageNum)
    }

    self.pageRight = () => {
        const pageNum = self.pageNumber()
        self.pageNumber(pageNum + 1)
    }

    self.executeSql = () => {
        if (! self.selectedSimulation())
            return 

        const url = "/api/sql";
        const data = {
            query: self.sqlQuery(),
            guid: self.selectedSimulation().guid,
            pageNumber: self.pageNumber(),
            rowsPerPage: self.rowsPerPage()
        };

        // Make the fetch request
        fetch(url, {
            method: 'POST',   // Using POST method to send the data
            headers: {
                'Content-Type': 'application/json',  // Indicating that we're sending JSON data
            },
            body: JSON.stringify(data)  // Convert the JavaScript object to a JSON string
        })
        .then(response => {
            // Process the response here
            // This function is called when the server response is available
            // Check if the response is ok, then convert it to JSON
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(data => {
            // Handle the data from the server
            // This function handles the JSON data returned from the server
            
            self.tableFields(new TableModel(data.result, data.header))
        
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    self.rowsPerPage.subscribe(self.executeSql)
    self.pageNumber.subscribe(self.executeSql)
}

// Apply bindings only after the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Now set up the subscription

    // Apply Knockout bindings
    ko.applyBindings(new DirectoryModel());
});
