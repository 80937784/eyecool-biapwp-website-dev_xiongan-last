<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="16" :sm="16" :lg="6" class="card-panel-col">
      <el-card
        shadow="always"
        :body-style="{ padding: '0 15px 15px 15px' }"
        class="card-panel-icon-wrapper icon-people"
      >
        <div slot="header">
          <span class="label label-danger pull-right">黑名单</span>
          <h5>人员信息</h5>
        </div>
        <div>
          <h1>{{ basePersonCountInfo }}</h1>
          <div class="stat-percent font-bold text-danger">
            <span>{{ blackListRatio }}%</span> <i class="el-icon-info"></i>
          </div>
          <small>总人数</small>
        </div>
      </el-card>
    </el-col>
    <el-col :xs="16" :sm="16" :lg="6" class="card-panel-col">
      <el-card
        shadow="always"
        :body-style="{ padding: '0 15px 15px 15px' }"
        class="card-panel-icon-wrapper icon-people"
      >
        <div slot="header">
          <span class="label label-success pull-right">多模态</span>
          <h5>支持场景</h5>
        </div>
        <div>
          <h1>{{ channelCountInfo }}</h1>
          <div class="stat-percent font-bold text-success">
            <span>{{ multiBioChannelRatio }}%</span>
            <i class="el-icon-info"></i>
          </div>
          <small>场景数</small>
        </div>
      </el-card>
    </el-col>
    <el-col :xs="16" :sm="16" :lg="6" class="card-panel-col">
      <el-card
        shadow="always"
        :body-style="{ padding: '0 15px 15px 15px' }"
        class="card-panel-icon-wrapper icon-people"
      >
        <div slot="header">
          <span class="label label-warning pull-right">在线设备</span>
          <h5>接入设备</h5>
        </div>
        <div>
          <h1>{{ deviceCountInfo }}</h1>
          <div class="stat-percent font-bold text-warning">
            <span>{{ onlineDeviceRatio }}%</span> <i class="el-icon-info"></i>
          </div>
          <small>设备数</small>
        </div>
      </el-card>
    </el-col>
    <el-col :xs="16" :sm="16" :lg="6" class="card-panel-col">
      <el-card
        shadow="always"
        :body-style="{ padding: '0 15px 15px 15px' }"
        class="card-panel-icon-wrapper icon-people"
      >
        <div slot="header">
          <span class="label label-primary pull-right">成功率</span>
          <h5>交易服务</h5>
        </div>
        <div>
          <h1>{{ serviceTotalCount }}</h1>
          <div class="stat-percent font-bold text-primary">
            <span>{{ serviceTotalSuccRatio }}%</span>
            <i class="el-icon-info"></i>
          </div>
          <small>总次数</small>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { queryBasePersonCountInfo, queryChannelCountInfo, queryDeviceCountInfo, queryServiceCountInfo } from "@/api/dashboard/statistic";

export default {
  components: {
    CountTo
  },
  methods: {

  },
  created() {
    queryBasePersonCountInfo().then((result) => {
      this.basePersonCountInfo = result.data.personCount;
      this.blackListRatio = result.data.blackListRatio;
    }).catch((err) => {
      console.log(err);
    });
    queryChannelCountInfo().then((result) => {
      this.channelCountInfo = result.data.channelCount;
      this.multiBioChannelRatio = result.data.multiBioChannelRatio;
    }).catch((err) => {
      console.log(err);
    });
    queryDeviceCountInfo().then((result) => {
      this.deviceCountInfo = result.data.deviceCount;
      this.onlineDeviceRatio = result.data.onlineDeviceRatio;
    }).catch((err) => {
      console.log(err);
    });
    queryServiceCountInfo().then((result) => {
      this.serviceTotalCount = result.data.serviceTotalCount;
      this.serviceTotalSuccRatio = result.data.serviceTotalSuccRatio;
    }).catch((err) => {
      console.log(err);
    });
  },
  data() {
    return {
      basePersonCountInfo: 0,
      deviceCountInfo: 0,
      channelCountInfo: 0,
      serviceTotalCount: 0,
      blackListRatio: 0,
      multiBioChannelRatio: 0,
      onlineDeviceRatio: 0,
      serviceTotalSuccRatio: 0,
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 250px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3;
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3;
    }

    .card-panel-icon-wrapper {
      display: none !important;
      // float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      // float: left;
      font-size: 48px;
    }

    .card-panel-description {
      // float: right;
      color: #ffffff;
      text-align: center;
      font-weight: bold;
      margin: 6px;
      height: 235px;
      padding-top: 2px;
      .card-panel-text {
        line-height: 18px;
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width: 550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
.card-panel-count {
  font-size: 100px;
}
.text-danger {
  color: #ed5565;
}
.text-success {
  color: #1c84c6;
}
.text-warning {
  color: #f8ac59;
}
.text-primary {
  color: #1ab394;
}
.font-bold {
  font-weight: 600;
}
.stat-percent {
  float: right;
}
.badge-danger,
.label-danger {
  background-color: #ed5565;
  color: #fff;
}
.badge-success,
.label-success {
  background-color: #1c84c6;
  color: #fff;
}
.badge-warning,
.label-warning {
  background-color: #f8ac59;
  color: #fff;
}
.badge-primary,
.label-primary {
  background-color: #1ab394;
  color: #fff;
}
.label {
  display: inline;
  padding: 0.2em 0.6em 0.3em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25em;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  text-shadow: none;
}
.pull-right {
  float: right !important;
}
h1 {
  font-size: 30px;
  font-weight: 100;
}
</style>
