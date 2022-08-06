import * as React from 'react'
import { Debug } from '../../helpers/Debug'
import { BugReportScren } from '../screens/bug-report/BugReportScreen'

export class TopLevelErrorBoundary extends React.Component<{}, { hasError: boolean }> {
    public static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true }
    }

    public state = { hasError: false }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        Debug.log(error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return <BugReportScren errorView={true}/>
        }
        return this.props.children
    }
}
