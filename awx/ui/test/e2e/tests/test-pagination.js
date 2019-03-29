import {
    getAdminMachineCredential,
    getInventorySource,
    getJobTemplate,
    getOrganization,
    getProject,
} from '../fixtures';

import {
    AWX_E2E_TIMEOUT_MEDIUM,
} from '../settings';

const namespace = 'test-pagination';

module.exports = {

    before: (client, done) => {
        const resources = [
            getAdminMachineCredential(namespace),
            getOrganization(namespace),
            getProject(namespace),
            getInventorySource(namespace),
        ];

        for (let i = 0; i < 25; i++) {
            // Create enough job templates to make at least 2 pages of data
            resources.push(getJobTemplate(namespace, 'hello_world.yml', `${namespace}-job-template-${i}`, false));
        }

        Promise.all(resources)
            .then(() => {
                done();
            });

        client
            .login()
            .waitForAngular()
            .resizeWindow(1200, 1000);
    },

    'Test job template pagination operations': client => {
        client
            .useCss()
            .findThenClick('[ui-sref="templates"]', 'css')
            .waitForElementVisible('.SmartSearch-input')
            .clearValue('.SmartSearch-input')
            .setValue(
                '.SmartSearch-input',
                [`name.istartswith:"${namespace}"`, client.Keys.ENTER]
            );
        client.useXpath().expect.element('//a[text()="test-pagination-job-template-0"]')
            .to.be.visible.after(AWX_E2E_TIMEOUT_MEDIUM);
        client
            .useCss()
            .waitForSpinny()
            .findThenClick('.Paginate-controls--next', 'css');

        // Default search sort uses alphanumeric sorting, so template #9 is last
        client.useXpath().expect.element('//a[text()="test-pagination-job-template-9"]')
            .to.be.visible.after(AWX_E2E_TIMEOUT_MEDIUM);
        client.useXpath()
            .expect.element('//*[contains(@class, "Paginate-controls--active") and text()="2"]')
            .to.be.visible.after(AWX_E2E_TIMEOUT_MEDIUM);

        client
            .useCss()
            .findThenClick('.Paginate-controls--previous', 'css');
        // Default search sort uses alphanumeric sorting, so template #9 is last
        client.useXpath().expect.element('//a[text()="test-pagination-job-template-0"]')
            .to.be.visible.after(AWX_E2E_TIMEOUT_MEDIUM);
        client.useXpath()
            .expect.element('//*[contains(@class, "Paginate-controls--active") and text()="1"]')
            .to.be.visible.after(AWX_E2E_TIMEOUT_MEDIUM);
    },

    after: client => {
        client.end();
    }
};
