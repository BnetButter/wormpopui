function KeyValuePair(key, value, subscriber=null) {
    const self = this
    self.key = key
    self.value = ko.observable(value)
    if (subscriber)
        self.value.subscribe(subscriber)
}

function GenomeProperties(object) {
    const self = this
    self.variantName = ko.observable("Variant")
    self.keyValuePairs = Object.keys(object).map((key) => {
        const type = object[key]["type"]
        let value = object[key]["default"]

        if (type === "float") {
            value = parseFloat(value)
        }
        if (key === "variant") {
            return new KeyValuePair(key, value, (value) => { self.variantName(value) })
        }
        return new KeyValuePair(key, value)
    })
}

function GenomeVector() {
    const self = this;

    self.variants = ko.observableArray([]);
    self.schemaCache = null;

    // Fetch the genome schema and store it in the cache
    fetch("/genome-schema")
        .then(response => response.json())
        .then(data => {
            self.schemaCache = data;
            const defaultVariant = new GenomeProperties(data);
            defaultVariant.keyValuePairs.find((pair) => pair.key === "variant").value("Default");
            self.variants.push(defaultVariant)
        })
        .catch(error => {
            console.error('Error fetching genome schema:', error);
        });

    // Add a new variant using the schema from the cache
    self.addVariant = () => {
        if (self.schemaCache) {
            const genomeProperties = new GenomeProperties(self.schemaCache);
            self.variants.push(genomeProperties);
        } else {
            console.error('Schema cache is not available');
        }
    };

    // Remove a variant
    self.removeVariant = (variant) => {
        self.variants.remove(variant);
    };
}

var viewModel = new GenomeVector();
ko.applyBindings(viewModel)

document.getElementById('simulationForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Extract static parameters from the DOM
    const form = event.target;
    const formData = new FormData(form);
    const parameters = {};
    formData.forEach((value, key) => {
        if (!key.startsWith('variant_')) {
            parameters[key] = value;
        }
    });
    console.log(parameters)

    // Extract dynamic variant parameters from the view model
    const variants = viewModel.variants().map((variant, index) => {
        const variantData = {};
        variant.keyValuePairs.forEach(pair => {
            variantData[pair.key] = pair.value();
        });
        return variantData;
    });

    // Create the JSON body
    const postData = {
        parameters: parameters,
        variants: variants
    };

    // Send the POST request
    fetch('/run-simulation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        window.location.href = '/jobs.html'; // Redirect on success
        // Handle success response
    })
    .catch((error) => {
        console.error('Error:', error);
        // Handle error response
    });
});