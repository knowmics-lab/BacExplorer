export const saveConfig = async (formData, setFormData, setIsInvalidFolder, setValidateFolderMessage, setShowAlert, setIsConfig, setConfigFile) => {
    const date = new Date();
    const defaultName = "test_default_" +
        String(date.getDate()).padStart(2, "0") + "_" +
        String(date.getMonth() + 1).padStart(2, "0") + "_" + date.getFullYear();

    if (formData.NAME === "") {
        setFormData({
        ...formData,
        NAME: defaultName,
        });
    }

    const yamlData = {
        ...formData,
        NAME: formData.NAME === '' ? defaultName : formData.NAME,
        PAIRED: formData.PAIRED === 'yes' ? 'yes' : 'no',
        IDENTITY: parseInt(formData.IDENTITY),
        COVERAGE: parseInt(formData.COVERAGE),
    };

    const validatedFolder = await window.api.validateInputFolder(yamlData.INPUT, yamlData.TYPE);
    console.log("validated folder response: ", validatedFolder);
    console.log(validatedFolder.success);
    if (!validatedFolder.success) {
        // throw alert
        setIsInvalidFolder(true);
        setValidateFolderMessage(validatedFolder.message);
    } else {
        const yamlString = JSON.stringify(yamlData, null, 2);
        const response = await window.api.saveConfigFile(yamlString);
        if (response.success) {
        console.log('Config file saved at:', response.filePath);
        setIsConfig(true);
        setConfigFile(response.filePath);
        setShowAlert(true);
        } else {
        console.error('Failed to save config file:', response.error || 'Unknown error');
        }
    }
};