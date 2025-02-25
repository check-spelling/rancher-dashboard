<script>
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import RadioGroup from '@/components/form/RadioGroup';
import { _CREATE } from '@/config/query-params';
import { get } from '@/utils/object';

const HARVESTER_ADD_ON_CONFIG = [{
  variableName: 'ipam',
  key:          'cloudprovider.harvesterhci.io/ipam',
  default:      'dhcp'
}, {
  variableName: 'healthcheckPort',
  key:          'cloudprovider.harvesterhci.io/healthcheck-port',
  default:      '',
}, {
  variableName: 'healthCheckSuccessThreshold',
  key:          'cloudprovider.harvesterhci.io/healthcheck-success-threshold',
  default:      1,
}, {
  variableName: 'healthCheckFailureThreshold',
  key:          'cloudprovider.harvesterhci.io/healthcheck-failure-threshold',
  default:      3,
}, {
  variableName: 'healthCheckPeriod',
  key:          'cloudprovider.harvesterhci.io/healthcheck-periodseconds',
  default:      5,
}, {
  variableName: 'healthCheckTimeout',
  key:          'cloudprovider.harvesterhci.io/healthcheck-timeoutseconds',
  default:      3,
}];

export default {
  components: {
    LabeledInput,
    LabeledSelect,
    RadioGroup,
  },

  props: {
    mode: {
      type:    String,
      default: _CREATE,
    },

    value: {
      type:    Object,
      default: () => {
        return {};
      }
    },

    registerBeforeHook: {
      type:    Function,
      default: null
    },
  },

  created() {
    if (this.registerBeforeHook) {
      this.registerBeforeHook(this.willSave, 'harvesterWillSave');
    }
  },

  data() {
    const harvesterAddOnConfig = {};

    HARVESTER_ADD_ON_CONFIG.forEach((c) => {
      harvesterAddOnConfig[c.variableName] = this.value.metadata.annotations[c.key] || c.default;
    });

    return {
      ...harvesterAddOnConfig,
      healthCheckEnabled: !!harvesterAddOnConfig.healthcheckPort,
    };
  },

  computed: {
    ipamOptions() {
      return [{
        label: 'DHCP',
        value: 'dhcp',
      }, {
        label: 'Pool',
        value: 'pool',
      }];
    },

    portOptions() {
      const ports = this.value?.spec?.ports || [];

      return ports.filter(p => p.port && p.protocol === 'TCP').map(p => p.port) || [];
    },
  },

  methods: {
    willSave() {
      const errors = [];

      if (this.healthCheckEnabled && !this.healthcheckPort) {
        errors.push(this.t('validation.required', { key: this.t('harvester.service.healthCheckPort.label') }, true));
      }

      if (errors.length > 0) {
        return Promise.reject(errors);
      }

      HARVESTER_ADD_ON_CONFIG.forEach((c) => {
        this.value.metadata.annotations[c.key] = String(get(this, c.variableName));
      });

      if (!this.healthCheckEnabled) {
        delete this.value.metadata.annotations['cloudprovider.harvesterhci.io/healthcheck-port'];
        delete this.value.metadata.annotations['cloudprovider.harvesterhci.io/healthcheck-success-threshold'];
        delete this.value.metadata.annotations['cloudprovider.harvesterhci.io/healthcheck-failure-threshold'];
        delete this.value.metadata.annotations['cloudprovider.harvesterhci.io/healthcheck-periodseconds'];
        delete this.value.metadata.annotations['cloudprovider.harvesterhci.io/healthcheck-timeoutseconds'];
      }
    },
  },
};
</script>

<template>
  <div>
    <div class="row mt-30">
      <div class="col span-6">
        <LabeledSelect
          v-model="ipam"
          :mode="mode"
          :options="ipamOptions"
          :label="t('harvester.service.ipam.label')"
          :disabled="mode === 'edit'"
        />
      </div>
    </div>

    <div class="row mt-30">
      <div class="col span-6">
        <RadioGroup
          v-model="healthCheckEnabled"
          :mode="mode"
          name="healthCheckEnabled"
          :label="t('harvester.service.healthCheckEnabled.label')"
          :labels="[t('generic.disabled'),t('generic.enabled')]"
          :options="[false, true]"
        />
      </div>
    </div>
    <div v-if="healthCheckEnabled">
      <div class="row mt-10">
        <div v-if="healthCheckEnabled" class="col span-6">
          <LabeledSelect
            v-model="healthcheckPort"
            :mode="mode"
            :options="portOptions"
            required
            :label="t('harvester.service.healthCheckPort.label')"
            :tooltip="t('harvester.service.healthCheckPort.description')"
          />
        </div>
        <div class="col span-6">
          <LabeledInput
            v-model="healthCheckSuccessThreshold"
            :mode="mode"
            type="number"
            :label="t('harvester.service.healthCheckSuccessThreshold.label')"
            :tooltip="t('harvester.service.healthCheckSuccessThreshold.description')"
          />
        </div>
      </div>
      <div class="row mt-10">
        <div class="col span-6">
          <LabeledInput
            v-model="healthCheckFailureThreshold"
            :mode="mode"
            type="number"
            :label="t('harvester.service.healthCheckFailureThreshold.label')"
            :tooltip="t('harvester.service.healthCheckFailureThreshold.description')"
          />
        </div>
        <div class="col span-6">
          <LabeledInput
            v-model="healthCheckPeriod"
            :mode="mode"
            type="number"
            :label="t('harvester.service.healthCheckPeriod.label')"
          />
        </div>
      </div>
      <div class="row mt-10">
        <div class="col span-6">
          <LabeledInput
            v-model="healthCheckTimeout"
            :mode="mode"
            type="number"
            :label="t('harvester.service.healthCheckTimeout.label')"
          />
        </div>
      </div>
    </div>
  </div>
</template>
