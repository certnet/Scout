import React, { Component, PropTypes as T } from 'react'
import { Table, Button, Icon, Popconfirm, Tag, message } from 'antd'
import { Link } from 'react-router'
import fetch from 'isomorphic-fetch'
import { interpolateWarm } from 'd3'
import $ from './style.css'
import { origin, colors as C } from '../../config'
import HealthChart from './HealthChart'
import formatTinyTime from '../../utils/formatTinyTime'

export default class Scouts extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
    }
  }
  componentDidMount() {
    const get = () => {
      this.setState({ loading: true })
      fetch(`${origin}/scouts`)
      .then(res => res.json())
      .then((scouts) => {
        this.props.setScouts(scouts.reverse())
        this.setState({ loading: false })
      })
      this.timeout = setTimeout(get, 60000)
    }
    get()
  }
  componentWillUnmount() {
    clearTimeout(this.timeout)
  }
  delScout(id) {
    fetch(`${origin}/scout/${id}`, {
      method: 'DELETE',
    })
    .then(() => {
      message.success('删除成功')
      this.props.setScouts(this.props.scouts.filter(scout => scout.id !== id))
    })
  }
  render() {
    const columns = [
      {
        title: '　',
        dataIndex: 'status',
        width: 50,
        render: status => ({
          OK: <Icon
            type="check"
            style={{ color: C.green }}
          />,
          Error: <Icon
            type="exclamation"
            style={{ color: C.yellow }}
          />,
          Idle: <Icon
            type="pause"
            style={{ color: C.grey }}
          />,
        }[status || 'Idle']),
        className: $.icon,
      },
      {
        title: '名称',
        dataIndex: 'name',
        render: (name, record) => (
          <div>
            <div>
              <Link to={`/stats/${record.id}`} className={$.name}>{name}</Link>
              {record.tags.map(tag => (
                <Tag key={tag} style={{ color: '#989898' }}>{tag}</Tag>
              ))}
            </div>
            <div
              className={$.longtext}
              style={{ color: C.grey, maxWidth: 400 }}
            >{record.URL}</div>
          </div>
        ),
      },
      {
        title: '过去 24 小时的健康度',
        dataIndex: 'statuses',
        width: 300,
        render: (statuses, record) => (
          <HealthChart now={record.now} statuses={statuses} />
        ),
      },
      {
        title: 'Apdex',
        dataIndex: 'Apdex',
        className: $.Apdex,
        render: (Apdex, record) => (
          <div>
            { typeof Apdex !== 'number' ?
              <span style={{ color: C.grey }}>NaN</span> :
              <span style={{ color: interpolateWarm(Apdex) }}>{Apdex.toFixed(2)}</span> }
            <div className={$.ApdexTarget}>~{formatTinyTime(record.ApdexTarget)}</div>
          </div>
        ),
      },
      {
        dataIndex: 'edit',
        width: 50,
        fixed: 'right',
        className: $.icon,
        render: (text, record) => (
          <a onClick={() => this.props.openModal(record.id)}>
            <Icon type="edit" />
          </a>
        ),
      },
      {
        dataIndex: 'delete',
        width: 50,
        fixed: 'right',
        className: $.icon,
        render: (text, record) => (
          <Popconfirm
            title="确定删除？"
            placement="topRight"
            onConfirm={() => this.delScout(record.id)}
          >
            <a><Icon type="delete" style={{ color: C.red }} /></a>
          </Popconfirm>
        ),
      },
    ]
    return (<Table
      className={$.scout}
      columns={columns}
      footer={() => (
        <div style={{ textAlign: 'right' }}>
          <Button type="primary" size="large" onClick={() => { this.props.openModal() }}>
            <Icon type="plus" />添加
          </Button>
        </div>
      )}
      rowKey="id"
      dataSource={this.props.scouts}
      loading={this.state.loading}
    />)
  }
}

Scouts.propTypes = {
  scouts: T.arrayOf(T.shape({
    id: T.string,
  })),
  setScouts: T.func,
  openModal: T.func,
}
