var fileHandler = {
    systemDirectory: '',
    workFileDirectory: '',
    examplesDirectory: '',
    setDirectories: function () {
        if (!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {

        } else {
            this.systemDirectory = cordova.file.externalDataDirectory || cordova.file.dataDirectory;
            //            alert(this.systemDirectory);
            this.workFileDirectory = this.systemDirectory + constants.PARENT_FOLDER_NAME + "/" + constants.STORED_FILES_FOLDER_NAME;
            //            alert(this.workFileDirectory);
        }
    },
    saveWorkFile: function (data) {
        applicationController.showWaitScreen();

        fileHelper.resolveURL(this.workFileDirectory, "Unable to save file", function (dataDirectory) {
            fileHelper.getFile(dataDirectory, data.fileName, true, "Unable to save file", function (fileEntry) {
                fileHelper.openFile(fileEntry, "Unable to save file", function (file) {
                    var reader = new FileReader();
                    reader.onloadend = function (e) {
                        var content = e.target.result;
                        var xmlContent = xmlFileHelper.makeXMLContent(content, data);

                        fileHelper.writeToFile(fileEntry, "Unable to save file", (new XMLSerializer()).serializeToString(xmlContent));
                    };
                    reader.readAsText(file);
                });
                fileHelper.getFile(dataDirectory, data.imageName, true, "Unable to save to file", function (fileEntry) {
                    var image = canvasCore.getCombinedImage(false);

                    fileHelper.writeToFile(fileEntry, "Unable to save to file", helper.convertImageToBlob(image), function () {
                        $('#homeScreen li[fileId="' + data.fileId + '"] img').attr('src', image);
                        applicationController.hideWaitScreen();
                    });
                });
            });
        });
    },
    readWorkFile: function (fileName, hasLocation, synthAfterLoad) {
        applicationController.showWaitScreen();
        var location = hasLocation ? '' : (this.workFileDirectory + "/");

        fileHelper.resolveURL(location + fileName, "Unable to read from file", function (fileEntry) {
            fileHelper.openFile(fileEntry, "Unable to read from file", function (file) {
                var reader = new FileReader();

                reader.onloadend = function (e){
                    fileHandler.readerOnLoad(e);
                };

                reader.readAsText(file);
            });
        });
    },
    readImportedFile: function (fileName, hasLocation, synthAfterLoad) {
        applicationController.showWaitScreen();
        var location = hasLocation ? '' : (this.workFileDirectory + "/");

        fileHelper.resolveURL(location + fileName, "Unable to read from file", function (fileEntry) {
            fileHelper.openFile(fileEntry, "Unable to read from file", function (file) {
                var reader = new FileReader();

                reader.onloadend = function (e){
                    fileHandler.readerOnLoad(e);
                };

                reader.readAsText(file);
            });
        });
    },
    exportToFile: function (directoryPath, fileName, content, sendEmail) {
        var showExportResult = function (success, fileName, showExportOptions) {
            $('#exportTypes').hide();
            $('li.message').hide();
            $('#sendEmail').attr('fileName', fileName);
            $('#exportOptions').hide();

            if (success)
                $('#successMsg').show();
            else
                $('#failureMsg').show();

            if (showExportOptions)
                $('#exportOptions').show();

            $('#exportResult').show();
        };

        var failed = function (reason) {
            showExportResult(false, '', false);
        };

        fileHelper.resolveURL(this.systemDirectory, "Unable to save file", function (dataDirectory) {
            fileHelper.getDirectory(dataDirectory, constants.PARENT_FOLDER_NAME, true, "Unable to save file", function (parentDirectory) {
                fileHelper.getDirectory(parentDirectory, directoryPath, true, "Unable to save file", function (directory) {
                    fileHelper.getFile(directory, fileName, true, "Unable to save file", function (file) {
                        file.createWriter(function (fileWriter) {
                            fileWriter.write(content);
                            showExportResult(true, file.toURL(), true);
                        }, failed);
                    });
                });
            });
        });
    },
    saveWorkFile1: function (data) {
        var xmlContent = xmlFileHelper.makeXMLContent('', data);
        return xmlContent;
    },
    readExampleFile1: function (file, synthAfterLoad) {
        var reader = new FileReader();

        reader.onloadend = function (e) {
            var content = e.target.result;
            var xmlContent = $.parseXML(content);

            var data = xmlFileHelper.readXMLContent(xmlContent);

            if (data.backgroundImageInfo && !$.isEmptyObject(data.backgroundImageInfo)) {
                applicationController.setBackgroundImage(data.backgroundImageInfo[XMLAttributes.VISIBLE] == 'true',
                    data.backgroundImageInfo[XMLAttributes.FILE_PATH],
                    data.backgroundImageInfo[XMLAttributes.OPACITY]);
            }

            if (data.gridInfo && !$.isEmptyObject(data.gridInfo)) {
                applicationController.setGridDisplay(data.gridInfo[XMLAttributes.VISIBLE] == 'true');
                canvasCore.setPanAndZoom(data.gridInfo[XMLAttributes.PAN_X],
                    data.gridInfo[XMLAttributes.PAN_Y],
                    data.gridInfo[XMLAttributes.SCALE]);
            }

            if (data.workspaceInfo && !$.isEmptyObject(data.workspaceInfo)) {
                canvasCore.setWorkspace(data.workspaceInfo.width, data.workspaceInfo.height, data.workspaceInfo.margin);
            }

            drawables.loadConstraintsFromXMLFile(data.constraintInfo);
            drawables.loadLinkageFromXMLFile(data.linkageInfo);
            drawables.loadCapturedConstraintsFromXMLFile(data.capturedConstraints);
            drawables.loadSynthResultsFromXMLFile(data.synthResults);
            drawables.refreshConstraintsOnDraw();

            if (synthAfterLoad && data.linkageInfo.data.length == 0 && data.synthResults.data.length == 0)
                menuCore.synthesizeMechanism();

            applicationController.hideWaitScreen();
            applicationController.refreshDisplay();
        };

        reader.readAsText(file);
    },
    setReadingFile: function (finalFunction) {
        if ((!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/))) {

        } else {
            if (applicationController.file != '') {
                applicationController.showWaitScreen();

                var failed = function (reason) {
                    alert("unable to load files");
                    applicationController.hideWaitScreen();
                };

                var location = (cordova.file.externalDataDirectory == null ? cordova.file.dataDirectory : cordova.file.externalDataDirectory) + constants.PARENT_FOLDER_NAME + "/" + constants.STORED_FILES_FOLDER_NAME;

                window.resolveLocalFileSystemURL(location, function (dataDirectory) {
                    dataDirectory.getFile(Files.APPLICATION_FILE, {
                        create: false
                    }, function (fileEntry) {
                        fileEntry.file(function (file) {
                            var reader = new FileReader();

                            reader.onloadend = function (e) {
                                var content = e.target.result;
                                var xmlContent = $.parseXML(content);
                                var found = false;
                                var files = xmlContent.getElementsByTagName('file');
                                var largestId = 1;

                                for (var i = 0; i < files.length; i++) {
                                    var id = parseInt(files[i].getAttribute(XMLAttributes.ID));

                                    if (files[i].hasAttribute(XMLAttributes.IS_OPEN))
                                        files[i].removeAttribute(XMLAttributes.IS_OPEN);

                                    if (id > largestId)
                                        largestId = id;

                                    if (id == applicationController.fileId) {
                                        files[i].setAttribute(XMLAttributes.IS_OPEN, true);
                                        found = true;
                                    }
                                }

                                if (!found) {
                                    largestId++;
                                    applicationController.setNameAndPath(Files.NEW_FILE.replace('{d}', largestId), "New File " + largestId, largestId);
                                    helper.addChildElementsOfType(xmlContent, xmlContent.documentElement, 'file', [applicationController.getSavableInfo()]);
                                }

                                fileHelper.writeToFile(fileEntry, "Unable to write to file", (new XMLSerializer()).serializeToString(xmlContent), function () {
                                    if (finalFunction != null)
                                        finalFunction();

                                    applicationController.hideWaitScreen();
                                });
                            };
                            reader.readAsText(file);
                        }, failed);
                    }, failed);
                }, failed);
            }
        }
    },
    deleteFile: function (fileId, finalFunction) {
        if ((!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/))) {

        } else {
            if (applicationController.file != '') {
                applicationController.showWaitScreen();

                var failed = function (reason) {
                    alert("unable to load files");
                    applicationController.hideWaitScreen();
                };

                var location = cordova.file.externalDataDirectory == null ? cordova.file.dataDirectory : cordova.file.externalDataDirectory;

                window.resolveLocalFileSystemURL(location + constants.PARENT_FOLDER_NAME + "/" + constants.STORED_FILES_FOLDER_NAME, function (dataDirectory) {
                    dataDirectory.getFile(Files.APPLICATION_FILE, {
                        create: false
                    }, function (fileEntry) {
                        fileEntry.file(function (file) {
                            var reader = new FileReader();

                            reader.onloadend = function (e) {
                                var content = e.target.result;
                                var xmlContent = $.parseXML(content);
                                var found = false;
                                var files = xmlContent.getElementsByTagName('file');
                                var file;

                                for (var i = 0; i < files.length; i++) {
                                    var id = parseInt(files[i].getAttribute(XMLAttributes.ID));

                                    if (id == fileId) {
                                        file = files[i];
                                        found = true;
                                    }
                                }

                                if (found) {
                                    xmlContent.getElementsByTagName('files')[0].removeChild(file);
                                }

                                fileEntry.createWriter(function (fileWriter) {
                                    fileWriter.onwriteend = function (e) {
                                        fileWriter.onwriteend = null;

                                        this.truncate(this.position);

                                        if (finalFunction != null)
                                            finalFunction();

                                        applicationController.hideWaitScreen();

                                        return;
                                    };

                                    fileWriter.write((new XMLSerializer()).serializeToString(xmlContent));
                                }, failed);

                            };

                            reader.readAsText(file);
                        }, failed);
                    }, failed);
                }, failed);
            }
        }
    },
    loadWorkingFiles: function () {
        var failed = function (reason) {
            alert("unable to load files");
            applicationController.hideWaitScreen();
        };

        applicationController.showWaitScreen();
        window.resolveLocalFileSystemURL(this.systemDirectory, function (dataDirectory) {
            dataDirectory.getDirectory(constants.PARENT_FOLDER_NAME, {
                create: true
            }, function (parentDirectory) {
                parentDirectory.getDirectory(constants.STORED_FILES_FOLDER_NAME, {
                    create: true
                }, function (storedDirectory) {
                    storedDirectory.getFile(Files.APPLICATION_FILE, {
                        create: true
                    }, function (fileEntry) {
                        fileEntry.file(function (file) {
                            var reader = new FileReader();

                            reader.onloadend = function (e) {
                                var content = e.target.result;
                                var xmlContent;
                                var filesNode;

                                if (content.length == 0) {
                                    xmlContent = $.parseXML('<files/>');
                                    filesNode = xmlContent.documentElement;

                                    applicationController.setNameAndPath(Files.NEW_FILE.replace('{d}', 1), "New File 1", 1);
                                    applicationFileController.saveWorkFile();

                                    helper.addChildElementsOfType(xmlContent, filesNode, XMLNodes.FILE, [applicationController.getCurrentFileInfo()]);

                                } else {
                                    xmlContent = $.parseXML(content);
                                    filesNode = xmlContent.documentElement;
                                }

                                var files = helper.getChildElementsOfType(filesNode, XMLNodes.FILE);
                                $('#homeScreen ul').html("");

                                for (var i = 0; i < files.length; i++) {
                                    var clss = "";

                                    if (files[i][XMLAttributes.IS_OPEN] == "true") {
                                        clss = 'selected picked';
                                        applicationController.setNameAndPath(files[i][XMLAttributes.NAME], files[i][XMLAttributes.DISPLAY_NAME], files[i][XMLAttributes.ID]);
                                    }

                                    $('#homeScreen ul').append('<li class="' + clss + '" fileName="' + files[i][XMLAttributes.NAME] + '" screenName="' + files[i][XMLAttributes.DISPLAY_NAME] + '" fileId="' + files[i][XMLAttributes.ID] + '"><a><img src=' + (fileHandler.systemDirectory + constants.PARENT_FOLDER_NAME + "/" + constants.STORED_FILES_FOLDER_NAME + "/" + files[i][XMLAttributes.IMAGE_NAME]) + ' /></a></li>');
                                }

                                fileEntry.createWriter(function (fileWriter) {
                                    fileWriter.onwriteend = function (e) {
                                        fileWriter.onwriteend = null;
                                        this.truncate(this.position);

                                        applicationFileController.readWorkFile();
                                        applicationController.hideWaitScreen();
                                        return;
                                    };

                                    fileWriter.write((new XMLSerializer()).serializeToString(xmlContent));
                                }, failed);
                            };

                            reader.readAsText(file);
                        }, failed);
                    }, failed);
                }, failed);
            }, failed);
        }, failed);
    },
    loadExamples: function () {

        var failed = function (reason) {
            alert("unable to access examples");
            applicationController.hideWaitScreen();
        };

        var failedLocation = function (reason) {
            alert("unable to locate file");
            applicationController.hideWaitScreen();
        };

        var readExamples = function (dir) {
            var fired = 0;
            $('#exampleHolder').html("");

            dir.createReader().readEntries(function (directories) {
                if (directories.length == 0) {
                    $('#exampleHolder').append("<a class='example-close' id='closeExample'>Close</a>");
                    applicationController.hideWaitScreen();
                } else {

                    var readFileEntries = function (files) {
                        fired++;
                        if (files.length > 0) {
                            var pathNodes = files[0].fullPath.split('\/');
                            var folderName = pathNodes[pathNodes.length - 2];
                            var displayName = folderName.substring(folderName.indexOf('.') + 1).replace(/_/g, ' ');

                            $('#exampleHolder').append("<a class='section-title'>" + displayName + "</a><ul></ul>");

                            for (var j = 0; j < files.length; j++) {
                                if (files[j].isFile) {
                                    var fileName = files[j].name;
                                    var fileDisplayName = fileName.substring(fileName.indexOf('.') + 1).replace('.txt', '').replace(/_/g, ' ');
                                    $('#exampleHolder ul:last').append("<li><a class='example' fileLocation='" + files[j].toURL() + "'>" + fileDisplayName + "</a></li>");
                                }
                            }
                        }

                        if (fired == directories.length) {
                            $('#exampleHolder').append("<a class='example-close' id='closeExample'>Close</a>");
                            applicationController.hideWaitScreen();
                        }
                    };

                    for (var i = 0; i < directories.length; i++) {
                        if (directories[i].isDirectory) {
                            directories[i].createReader().readEntries(readFileEntries, failed);
                        } else if (i == (directories.length - 1)) {
                            $('#exampleHolder').append("<a class='example-close' id='closeExample'>Close</a>");
                            applicationController.hideWaitScreen();
                        }
                    }
                }
            }, failed);
        };

        if (!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {

        } else if (navigator.userAgent.match(/(Android)/)) {
            applicationController.showWaitScreen();

            var location = cordova.file.externalDataDirectory == null ? cordova.file.dataDirectory : cordova.file.externalDataDirectory;

            window.resolveLocalFileSystemURL(location, function (dataDirectory) {
                dataDirectory.getDirectory(constants.PARENT_FOLDER_NAME, {
                    create: true
                }, function (parentDirectory) {
                    var path = cordova.file.externalDataDirectory == null ? parentDirectory.toURL() : parentDirectory.toURL().replace('file:///storage/emulated/', '');
                    path = path.substring(path.indexOf('/') + 1);

                    fileHelper.copyFolder("www/" + constants.EXAMPLES_FOLDER_NAME, path + "/" + constants.EXAMPLES_FOLDER_NAME, function () {
                        window.resolveLocalFileSystemURL(location + constants.PARENT_FOLDER_NAME + "/" + constants.EXAMPLES_FOLDER_NAME, function (dir) {
                            readExamples(dir);
                        }, failed);
                    }, function () {});
                }, failedLocation);
            }, failedLocation);
        } else {
            applicationController.showWaitScreen();

            window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + "www/" + constants.EXAMPLES_FOLDER_NAME, function (dir) {
                readExamples(dir);
            }, failed);
        }
    },
    readerOnLoad: function (e) {
        try {
            try{
            var content = e.target.result;
            var xmlContent = $.parseXML(content);

            var data = xmlFileHelper.readXMLContent(xmlContent);

            if (data.displayName)
                applicationController.screenName = data.displayName;

            if (data.applicationInfo && !$.isEmptyObject(data.applicationInfo)) {
                applicationController.setApplicationMode(data.applicationInfo[XMLAttributes.MODE],
                    data.applicationInfo[XMLAttributes.DRAWABLE],
                    data.applicationInfo[XMLAttributes.POSE_DENSITY]);
            }

            if (data.gridInfo && !$.isEmptyObject(data.gridInfo)) {
                applicationController.setGridDisplay(data.gridInfo[XMLAttributes.VISIBLE] == 'true');
                canvasCore.setPanAndZoom(data.gridInfo[XMLAttributes.PAN_X],
                    data.gridInfo[XMLAttributes.PAN_Y],
                    data.gridInfo[XMLAttributes.SCALE]);
                canvasGrid.toggleViewStyle(JSON.parse(data.gridInfo[XMLAttributes.KINEMATIC_STYLE]));
                canvasGrid.toggleLinkNumbers(JSON.parse(data.gridInfo[XMLAttributes.LINK_NUMBERS]));
            }

            if (data.workspaceInfo && !$.isEmptyObject(data.workspaceInfo)) {
                canvasCore.setWorkspace(data.workspaceInfo.width, data.workspaceInfo.height, data.workspaceInfo.margin);
            }

            drawables.loadConstraintsFromXMLFile(data.constraintInfo);
            drawables.loadCapturedConstraintsFromXMLFile(data.capturedConstraints);
                //Disabled so that dyads are not imported, user can reSynthesize using button incase needed
            //drawables.loadSynthResultsFromXMLFile(data.synthResults);
            var branchChange = drawables.loadLinkageFromXMLFile(data.linkageInfo);

            if (branchChange)
                applicationController.triggerBranchChange();

            drawables.refreshConstraintsOnDraw();

            if (data.linkageInfo.data.length == 0)
                menuCore.synthesizeMechanism();
            else
                $('div.dyad-menu-holder').hide()

            applicationController.setCapturedPoseCount();
            applicationController.refreshDisplay(true);
            }
            catch(ex){

                var data = txtFileHelper.readTXTContent(content);
                var poseInfo = data.poseInfo;
                var jointInfo = data.jointInfo;
                var linkInfo = data.linkInfo;

                if(poseInfo.length > 0 || (jointInfo.length > 0 && linkInfo.length > 0))
                    drawables.deleteItems(-1);
                if (poseInfo.length > 0)
                    drawables.loadPosesFromTextFile(poseInfo);
                if(jointInfo.length > 0 && linkInfo.length > 0)
                    drawables.loadLinkageFromTextFile(jointInfo, linkInfo);
                else if(poseInfo.length > 0)
                    menuCore.synthesizeMechanism();

                    drawables.refreshConstraintsOnDraw();    
                    applicationController.setCapturedPoseCount();
                    applicationController.refreshDisplay();


            }
        }catch (ex) {
            alert('Corrupt File');
        } finally {
            applicationController.hideWaitScreen();
            if ($('#menuButton').hasClass('selected')) {
                $('#menuButton').trigger('click');
            }
            var step = drawables.updateAnimationStep();
            $('#timeSlider').attr('step', step);
            if(!$('#selectTool').hasClass('selected'))
                $('#selectTool').trigger(menuCore.buttonEvent);
        }
    }
};
var xmlFileHelper = {
    makeXMLContent: function (content, data) {
        var xmlContent = $.parseXML(content || '<file/>');

        var applicationNode = helper.getXMLNode(xmlContent, xmlContent.documentElement, XMLNodes.APPLICATION_NODE);
        var backgroundNode = helper.getXMLNode(xmlContent, xmlContent.documentElement, XMLNodes.BACKGROUND_NODE);
        var gridNode = helper.getXMLNode(xmlContent, xmlContent.documentElement, XMLNodes.GRID_NODE);
        var workspaceNode = helper.getXMLNode(xmlContent, xmlContent.documentElement, XMLNodes.WORKSPACE_NODE);
        var constraintsNode = helper.getXMLNode(xmlContent, xmlContent.documentElement, XMLNodes.CONSTRAINTS_NODE);
        var linkageNode = helper.getXMLNode(xmlContent, xmlContent.documentElement, XMLNodes.LINKAGE_NODE);
        var synthesizedNode = helper.getXMLNode(xmlContent, xmlContent.documentElement, XMLNodes.SYNTHESIZED_NODE);
        var capturedConstraints = helper.getXMLNode(xmlContent, xmlContent.documentElement, XMLNodes.CAPTURED_NODE);
        var dyadVectorsNode = helper.getXMLNode(xmlContent, xmlContent.documentElement, XMLNodes.DYAD_VECTORS);


        if (data.displayName)
            xmlContent.documentElement.setAttribute(XMLAttributes.DISPLAY_NAME, data.displayName);

        helper.setAttributes(applicationNode, data.applicationInfo || []);
        helper.setAttributes(backgroundNode, data.backgroundImageInfo || []);
        helper.setAttributes(gridNode, data.gridInfo || []);
        helper.setAttributes(workspaceNode, data.workspaceInfo || []);
        helper.setAttributes(linkageNode, data.linkageInfo ? data.linkageInfo[0] : []);
        helper.setAttributes(capturedConstraints, data.capturedConstraints ? data.capturedConstraints[0] : []);
        helper.setAttributes(synthesizedNode, data.synthResults ? data.synthResults[0] : []);

        helper.removeChildElements(constraintsNode);
        helper.removeChildElements(linkageNode);
        helper.removeChildElements(synthesizedNode);
        helper.removeChildElements(capturedConstraints);

        helper.addChildElementsOfType(xmlContent, constraintsNode, 'constraint', data.constraintInfo || []);
        helper.addChildElementsOfType(xmlContent, dyadVectorsNode, 'dyadVector', data.dyadVectors || []);
        helper.addChildElementsOfType(xmlContent, linkageNode, 'link', data.linkageInfo ? data.linkageInfo.slice(1) : []);
        helper.addChildElementsOfType(xmlContent, synthesizedNode, 'dyad', data.synthResults ? data.synthResults.slice(1) : []);
        helper.addChildElementsOfType(xmlContent, capturedConstraints, 'constraint', data.capturedConstraints ? data.capturedConstraints.slice(1) : []);

        return xmlContent;
    },
    readXMLContent: function (xmlContent) {
        var data = {
            displayName: xmlContent.documentElement.getAttribute(XMLAttributes.DISPLAY_NAME),
            applicationInfo: helper.getAttributes(xmlContent.getElementsByTagName(XMLNodes.APPLICATION_NODE)[0]),
            backgroundImageInfo: helper.getAttributes(xmlContent.getElementsByTagName(XMLNodes.BACKGROUND_NODE)[0]),
            gridInfo: helper.getAttributes(xmlContent.getElementsByTagName(XMLNodes.GRID_NODE)[0]),
            workspaceInfo: helper.getAttributes(xmlContent.getElementsByTagName(XMLNodes.WORKSPACE_NODE)[0]),
            constraintInfo: helper.getChildElementsOfType(xmlContent.getElementsByTagName(XMLNodes.CONSTRAINTS_NODE)[0], ''),
            linkageInfo: {
                info: helper.getAttributes(xmlContent.getElementsByTagName(XMLNodes.LINKAGE_NODE)[0]),
                data: helper.getChildElementsOfType(xmlContent.getElementsByTagName(XMLNodes.LINKAGE_NODE)[0], '')
            },
            capturedConstraints: {
                info: helper.getAttributes(xmlContent.getElementsByTagName(XMLNodes.CAPTURED_NODE)[0]),
                data: helper.getChildElementsOfType(xmlContent.getElementsByTagName(XMLNodes.CAPTURED_NODE)[0], '')
            },
            synthResults: {
                info: helper.getAttributes(xmlContent.getElementsByTagName(XMLNodes.SYNTHESIZED_NODE)[0]),
                data: helper.getChildElementsOfType(xmlContent.getElementsByTagName(XMLNodes.SYNTHESIZED_NODE)[0], '')
            }
        };

        return data;
    },

};
var txtFileHelper = {
    readTXTContent: function (content) {
        var poseInfo = [];
        var jointInfo = [];
        var linkInfo = [];
        var groundJoints = [];
        var txtContent = content.split("\n");
         for (var i = 0; i < txtContent.length; i++){
             var str = txtContent[i].trim();
             if (str[0]=="/" || str == "") continue
             var currentInput;
             if(str.match(/posses/i)){
                currentInput = 'Posses';
                continue;}
             if(str.match(/joint/i)){
                currentInput = 'Joints';
                continue;}
             if(str.match(/link/i)){
                currentInput = 'Links';
                continue;}
             if(currentInput == 'Posses'){
                 str = str.replace(/\s\s+/g, ' ');// replaces multiple white spaces by one
                 str = str.replace(/[^\d\s\.\-]/g, '');// removes any charecters
                 str = str.split(" ");
                 if(str.length!=3) continue;
                 var pose = {
                     x: str[0],
                     y: str[1],
                     angle: str[2]
                 }
                 poseInfo.push(pose);
            } else if(currentInput == 'Joints'){
                str = str.replace(/\s\s+/g, ' ');// replaces multiple white spaces by one
                str = str.split(" ");
                if(str.length < 3 || str.length > 4) continue;
                str[0] = str[0].replace(/[^\d\s\.\-]/g, '');// removes any charecters
                str[1] = str[1].replace(/[^\d\s\.\-]/g, '');// removes any charecters
                str[2] = (str[2].match(/R/i)) ? 0 : 1; //0 for r type of joint
                if(str.length>3)
                str[3] = (str[3].match(/ground/i||/fixed/i||/g/i)) ? true : false
                else
                str.push(false);
                var joint = {
                    x: str[0],
                    y: str[1],
                    type: str[2],
                    isGround: str[3]
                }
                if(str[3])
                    groundJoints.push(jointInfo.length + 1);
                jointInfo.push(joint);
            } else if(currentInput == 'Links'){
                var link = {};
                var index = str.lastIndexOf('rgba')
                if(index != -1){
                    var color = str.substr(index, str.length);
                    str = str.substr(0, index - 1);
                    var rxValidRgb = /([R][G][B][A][(]\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])(\s*,\s*((0\.[0-9]{1})|(1\.0)|(1)))[)])/i;
                    if(rxValidRgb.test(color))
                        link['color'] = color;
                }
                var count = str.match(/->/g||/-/g||/=>/g).length;
                if(count < 1 || count > 2) continue;
                str = str.replace(/->/g||/-/g||/=>/g, ' ');// replaces -> by a space
                str = str.replace(/\s\s+/g, ' ');// replaces multiple white spaces by one
                str = str.split(" ");
                for(var strNo = 0; strNo < count + 1 ; strNo++){
                link['joint' + (strNo + 1)] = parseInt(str[strNo].replace(/[^\d\s\.\-]/g, ''));// removes any charecters
                }
                
                
                if(groundJoints.findIndex(item=> item == link.joint1) != -1)
                    linkInfo.splice(0,0,link)
                else
                    linkInfo.push(link);
            }
         }
        var data = {
            poseInfo: poseInfo,
            linkInfo: linkInfo,
            jointInfo: jointInfo
        }
        return data
    }
};