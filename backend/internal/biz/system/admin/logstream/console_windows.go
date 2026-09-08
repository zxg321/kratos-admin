//go:build windows

package logstream

import "fmt"

// StartConsoleCapture 在 Windows 上不接管进程控制台（unix.Dup/Dup2 仅 Unix 可用），
// 保持原样输出，仅返回成功以复用统一初始化流程。
func StartConsoleCapture(hub *Hub) error {
	if hub == nil {
		return fmt.Errorf("运行日志中心不能为空")
	}
	return nil
}
