var fileHelper = {
    onFail: function(errorMessage) {
        alert(errorMessage);
        applicationController.hideWaitScreen();
    },
    copyFolder: function(source, destination, successFunction, failFunction) {
        asset2sd.copyDir({
                asset_directory: source,
                destination_directory: destination
            },
            successFunction,
            failFunction
        );
    },
    resolveURL: function(url, errorMessage, successFunction) {
        window.resolveLocalFileSystemURL(url, successFunction, function() {
            fileHelper.onFail(errorMessage);
        });
    },
    getDirectory: function(parent, directoryName, shouldCreate, errorMessage, successFunction) {
        parent.getDirectory(directoryName, {
            create: shouldCreate
        }, successFunction, function(reason) {
            fileHelper.onFail(errorMessage);
        });
    },
    getFile: function(directory, fileName, shouldCreate, errorMessage, successFunction) {
        directory.getFile(fileName, {
            create: shouldCreate
        }, successFunction, function(reason) {
            fileHelper.onFail(errorMessage);
        });
    },
    openFile: function(fileEntry, errorMessage, successFunction) {
        fileEntry.file(successFunction, function(reason) {
            fileHelper.onFail(errorMessage);
        });
    },
    writeToFile: function(fileEntry, errorMessage, data, finalFunction) {
        fileEntry.createWriter(function(fileWriter) {
            fileWriter.onwriteend = function(e) {
                fileWriter.onwriteend = null;
                this.truncate(this.position);

                if (finalFunction != null)
                    finalFunction();

                return;
            };

            fileWriter.write(data);
        }, function(reason) {
            fileHelper.onFail(errorMessage);
        });
    }
};