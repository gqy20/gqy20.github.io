import { motion } from 'framer-motion'
import { FaGithub, FaEnvelope } from 'react-icons/fa'
import './Contact.css'

const Contact = () => {
  const contacts = [
    {
      icon: <FaGithub />,
      label: 'GitHub',
      href: 'https://github.com/gqy20',
      description: '查看我的开源项目'
    },
    {
      icon: <FaEnvelope />,
      label: 'Email',
      href: 'mailto:qingyu_ge@foxmail.com',
      description: 'qingyu_ge@foxmail.com'
    }
  ]

  return (
    <section className="contact">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          联系我
        </motion.h2>

        <motion.div
          className="contact-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="contact-text">
            如果你对我的项目感兴趣，或者想要合作交流，欢迎通过以下方式联系我：
          </p>

          <div className="contact-links">
            {contacts.map((contact, index) => (
              <motion.a
                key={contact.label}
                href={contact.href}
                target={contact.label === 'Email' ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="contact-link"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="contact-icon">
                  {contact.icon}
                </div>
                <div className="contact-info">
                  <div className="contact-label">{contact.label}</div>
                  <div className="contact-description">{contact.description}</div>
                </div>
              </motion.a>
            ))}
          </div>

          <motion.div
            className="contact-footer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p>期待与你的交流！</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact