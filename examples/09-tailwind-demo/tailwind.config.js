/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind 只编译"出现在这些文件里"的类名（按需生成，体积小）
  content: ["./index.html", "./src/**/*.{html,js}"],
  // 暗色模式走 class 策略：给 <html> 挂 .dark 即可手动切换
  darkMode: 'class',
  theme: {
    extend: {
      // 自定义品牌色，按 50~950 梯度定义（浅色背景 → 主色 → 深色 hover）
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
};
