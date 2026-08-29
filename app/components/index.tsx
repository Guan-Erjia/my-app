import { css, cx } from '@emotion/css'
import React, { ButtonHTMLAttributes, PropsWithChildren, Ref } from 'react'

export const Button = React.forwardRef(
  (
    {
      className,
      active,
      reversed,
      ...props
    }: PropsWithChildren<
      {
        active: boolean
        reversed?: boolean
      } & ButtonHTMLAttributes<HTMLButtonElement>
    >,
    ref: Ref<HTMLButtonElement>
  ) => (
    <button
      {...props}
      ref={ref}
      className={cx(
        css`
          border: none;
          background: none;
          padding: 0;
          cursor: pointer;
          color: ${reversed
            ? active
              ? 'white'
              : '#aaa'
            : active
            ? 'black'
            : '#ccc'};
        `,
        className
      )}
    />
  )
)

  
export const Icon = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren< React.HTMLAttributes<HTMLSpanElement>>,
    ref: Ref<HTMLSpanElement>
  ) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        'material-icons',
        className,
        css`
          font-size: 18px;
          vertical-align: text-bottom;
        `
      )}
    />
  )
)
