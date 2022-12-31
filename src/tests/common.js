const expectError = async (res, status) => {
    const receivedData = await res.json();
    if (res.status !== status) {
        console.log(`Expected error but received: status ${res.status}, data:\n`);
        console.log(receivedData);
    }
    expect(res.status).toBe(status);
    expect(receivedData).toHaveProperty('error');
};

const expectWithoutErrors = async (res) => {
    const receivedData = await res.json();
    if (res.status !== 200) {
        console.log(`Expected to not have an error but received: status ${res.status}, data:\n`);
        console.log(receivedData);
    }
    expect(res.status).toBe(200);
    expect(receivedData).not.toHaveProperty('error');
}

const expectSuccess = async (res) => {
    const receivedData = await res.json();
    if (res.status !== 200) {
        console.log(`Expected success but received: status ${res.status}, data:\n`);
        console.log(receivedData);
    }
    expect(res.status).toBe(200);
    expect(receivedData).toHaveProperty('success', true);
};

const expectToReceiveObject = async (res, object) => {
    const receivedData = await res.json();
    if (res.status !== 200) {
        console.log(`Expected to get an object but received: status ${res.status}, data:\n`);
        console.log(receivedData);
    }
    expect(res.status).toBe(200);
    for (const attribute of Object.keys(object)) {
        if (object[attribute]) {
            expect(receivedData).toHaveProperty(attribute, object[attribute]);
        } else {
            expect(receivedData).toHaveProperty(attribute);
        }
    }
    return receivedData;
};

const expectToReceiveObjectArray = async (res, objectArray) => {
    const receivedData = await res.json();
    if (res.status !== 200) {
        console.log(`Expected to get an object but received: status ${res.status}, data:\n`);
        console.log(receivedData);
    }
    expect(res.status).toBe(200);
    expect(receivedData.length).toBeGreaterThanOrEqual(objectArray.length); //Greater or equal to allow parallel tests
    for (const object of objectArray) {
            expect(receivedData).toContainEqual(object);
        }
    return receivedData;
};

const loginData = {
    user: null,
    accessToken: null,
    refreshToken: null,
};

const refreshData = {
    accessToken: null,
    refreshToken: null,
};

module.exports = {
    expectError,
    expectSuccess,
    expectToReceiveObject,
    expectToReceiveObjectArray,
    expectWithoutErrors,
    loginData,
    refreshData,
};