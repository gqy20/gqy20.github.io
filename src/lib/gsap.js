import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

// 集中注册插件:各组件从此处 import 复用,避免重复 registerPlugin。
// useGSAP 本身也是一个插件,必须在这里注册后才能使用。
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

export { gsap, ScrollTrigger, SplitText, useGSAP }
