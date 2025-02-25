<script>
import Tip from '@/components/Tip';
import { HCI } from '@/config/types';
import { HCI_SETTING } from '@/config/settings';
import Password from '@/components/form/Password';
import MessageLink from '@/components/MessageLink';
import CreateEditView from '@/mixins/create-edit-view';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';

export default {
  name: 'HarvesterEditBackupTarget',

  components: {
    LabeledInput, LabeledSelect, Tip, Password, MessageLink
  },

  mixins: [CreateEditView],

  data() {
    let parseDefaultValue = {};

    try {
      parseDefaultValue = JSON.parse(this.value.value);
    } catch (error) {
      parseDefaultValue = JSON.parse(this.value.default);
    }

    if (!parseDefaultValue.type) {
      parseDefaultValue.type = 's3';
    }

    return {
      parseDefaultValue,
      errors: []
    };
  },

  computed: {
    typeOption() {
      return [{
        value: 'nfs',
        label: 'NFS'
      }, {
        value: 's3',
        label: 'S3'
      }];
    },

    virtualHostedStyleType() {
      return [{
        value: true,
        label: 'True'
      }, {
        value: false,
        label: 'False'
      }];
    },

    isS3() {
      return this.parseDefaultValue.type === 's3';
    },

    endpointPlaceholder() {
      return this.isS3 ? '' : 'nfs://server:/path/';
    },

    toCA() {
      return `${ HCI.SETTING }/${ HCI_SETTING.ADDITIONAL_CA }?mode=edit`;
    }
  },

  watch: {
    'parseDefaultValue.type'(neu) {
      delete this.parseDefaultValue.accessKeyId;
      delete this.parseDefaultValue.secretAccessKey;
      delete this.parseDefaultValue.bucketName;
      delete this.parseDefaultValue.bucketRegion;
      delete this.parseDefaultValue.endpoint;
    },

    value: {
      handler(neu) {
        const parseDefaultValue = JSON.parse(neu.value);

        this.$set(this, 'parseDefaultValue', parseDefaultValue);
      },
      deep: true
    }
  },

  created() {
    this.update();
  },

  methods: {
    update() {
      const value = JSON.stringify(this.parseDefaultValue);

      this.$set(this.value, 'value', value);
    },
  }
};
</script>

<template>
  <div class="row" @input="update">
    <div class="col span-12">
      <LabeledSelect v-model="parseDefaultValue.type" class="mb-20" :label="t('harvester.fields.type')" :options="typeOption" @input="update" />

      <LabeledInput v-model="parseDefaultValue.endpoint" class="mb-5" :placeholder="endpointPlaceholder" :mode="mode" label="Endpoint" />
      <Tip class="mb-20" icon="icon icon-info" :text="t('harvester.backup.backupTargetTip')" />

      <template v-if="isS3">
        <LabeledInput
          v-model="parseDefaultValue.bucketName"
          class="mb-20"
          :mode="mode"
          label="Bucket Name"
          required
        />

        <LabeledInput
          v-model="parseDefaultValue.bucketRegion"
          class="mb-20"
          :mode="mode"
          label="Bucket Region"
          required
        />

        <LabeledInput
          v-model="parseDefaultValue.accessKeyId"
          :placeholder="t('harvester.setting.placeholder.accessKeyId')"
          class="mb-20"
          :mode="mode"
          label="Access Key ID"
          required
        />

        <Password
          v-model="parseDefaultValue.secretAccessKey"
          class="mb-20"
          :mode="mode"
          :placeholder="t('harvester.setting.placeholder.secretAccessKey')"
          label="Secret Access Key"
          required
        />

        <LabeledSelect v-model="parseDefaultValue.virtualHostedStyle" class="mb-20" label="Virtual Hosted-Style" :options="virtualHostedStyleType" @input="update" />

        <div class="mb-20">
          <Tip icon="icon icon-info">
            <MessageLink
              :to="toCA"
              target="_blank"
              prefix-label="harvester.setting.message.ca.prefix"
              middle-label="harvester.setting.message.ca.middle"
              suffic-label="harvester.setting.message.ca.suffic"
            />
          </Tip>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
p {
  display: flex;
  align-items: center;
}
.icon-h-question {
  font-size: 24px;
}
.tip {
  font-size: 15px;
}

.goCA {
  margin: 0 3px;
}
</style>
