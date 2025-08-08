import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock do Ant Design - versão mais simples
vi.mock('antd', () => {
  const React = require('react')
  
  const MockButton = ({ children, ...props }: any) => 
    React.createElement('button', { ...props, type: props.htmlType || 'button' }, children)
  
  const MockInput = ({ ...props }: any) => 
    React.createElement('input', { ...props, type: 'text' }, null)
  
  const MockInputPassword = ({ ...props }: any) => 
    React.createElement('input', { ...props, type: 'password' }, null)
  
  const MockTextArea = ({ ...props }: any) => 
    React.createElement('textarea', { ...props }, null)
  
  const MockCard = ({ children, title, ...props }: any) => 
    React.createElement('div', { ...props },
      title && React.createElement('h2', null, title),
      children
    )
  
  const MockTabs = ({ activeKey, onChange, items, ...props }: any) => 
    React.createElement('div', { ...props },
      items?.map((item: any, index: number) =>
        React.createElement('div', { key: item.key || index },
          React.createElement('button', { 
            onClick: () => onChange?.(item.key),
            className: activeKey === item.key ? 'active' : ''
          }, item.label),
          activeKey === item.key && React.createElement('div', null, item.children)
        )
      )
    )
  
  const MockFormItem = ({ children, label, name, rules, ...props }: any) => 
    React.createElement('div', { ...props },
      label && React.createElement('label', null, label),
      children
    )
  
  const MockForm = ({ children, onFinish, ...props }: any) => 
    React.createElement('form', { 
      ...props, 
      onSubmit: (e: any) => {
        e.preventDefault()
        onFinish?.({})
      }
    }, children)
  
  return {
    Button: MockButton,
    Input: Object.assign(MockInput, {
      Password: MockInputPassword,
      TextArea: MockTextArea,
    }),
    Card: MockCard,
    Tabs: MockTabs,
    Form: Object.assign(MockForm, {
      Item: MockFormItem,
      useForm: vi.fn(() => [{
        validateFields: vi.fn(),
        setFieldsValue: vi.fn(),
        getFieldsValue: vi.fn(),
        resetFields: vi.fn(),
      }]),
    }),
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
    notification: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  }
})

// Mock do react-router-dom
vi.mock('react-router-dom', () => ({
  BrowserRouter: vi.fn(({ children }) => {
    const React = require('react')
    return React.createElement('div', null, children)
  }),
  Routes: vi.fn(({ children }) => {
    const React = require('react')
    return React.createElement('div', null, children)
  }),
  Route: vi.fn(({ element }) => element),
  Link: vi.fn(({ children, to, ...props }) => {
    const React = require('react')
    return React.createElement('a', { ...props, href: to }, children)
  }),
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: '/', search: '', hash: '', state: null })),
  useParams: vi.fn(() => ({})),
}))

// Mock do dayjs
vi.mock('dayjs', () => ({
  default: vi.fn((date?: any) => ({
    format: vi.fn((format: string) => date || '2024-01-01'),
    toDate: vi.fn(() => new Date(date || '2024-01-01')),
  })),
}))
