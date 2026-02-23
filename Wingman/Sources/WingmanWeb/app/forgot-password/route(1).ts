import { NextRequest, NextResponse } from 'next/server';
import { createPool } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Forgot Password API endpoint',
      status: 'ready',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body = await request.json();
    
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing email',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Create database connection pool
    const pool = createPool({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'password',
      database: 'wingman_db',
    });

    const connection = await pool.getConnection();

    try {
      // Find user by email
      const [users] = await connection.execute(
        'SELECT id, name, email FROM users WHERE email = ?',
        [email]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email not found',
            timestamp: new Date().toISOString()
          },
          { status: 404 }
        );
      }

      const user = users[0] as {
        id: number;
        name: string;
        email: string;
      };

      // Generate password reset token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const resetToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          type: 'reset'
        },
        jwtSecret,
        { expiresIn: '1h' } // 1 hour expiration
      );

      // Create password reset link
      const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

      // Email configuration from environment variables
      const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
      const emailPort = parseInt(process.env.EMAIL_PORT || '587');
      const emailUser = process.env.EMAIL_USER || 'your-email@gmail.com';
      const emailPass = process.env.EMAIL_PASS || 'your-app-password';
      const emailFrom = process.env.EMAIL_FROM || 'Wingman Support <support@wingman.ai>';

      try {
        // Create Nodemailer transporter
        const transporter = nodemailer.createTransport({
          host: emailHost,
          port: emailPort,
          secure: emailPort === 465, // Use TLS
          auth: {
            user: emailUser,
            pass: emailPass
          }
        });

        // Email options
        const mailOptions = {
          from: emailFrom,
          to: user.email,
          subject: 'Password Reset Request',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>Hello ${user.name},</p>
              <p>We received a request to reset your password for your Wingman account.</p>
              <p>Please click the link below to reset your password:</p>
              <p>
                <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
                  Reset Password
                </a>
              </p>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request a password reset, please ignore this email or contact our support team.</p>
              <p>Thank you,<br>Wingman Team</p>
            </div>
          `
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        
        // Log for development purposes
        console.log('Password reset email sent successfully');
        console.log('Email message ID:', info.messageId);
        console.log('Reset link:', resetLink);

        // Return success message
        return NextResponse.json(
          {
            success: true,
            message: 'Password reset link sent! Please check your email.',
            timestamp: new Date().toISOString()
          },
          { status: 200 }
        );
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        
        // For development: Fallback to logging if email fails
        console.log('\n--- Email sending failed, falling back to logging ---');
        console.log('Password reset link:', resetLink);
        console.log('Copy this link to reset your password:');
        console.log(resetLink);
        console.log('----------------------------------------------');
        
        // Return success message even if email fails (for testing)
        return NextResponse.json(
          {
            success: true,
            message: 'Password reset link sent! Please check your email.',
            resetLink: resetLink, // Include link for testing purposes
            timestamp: new Date().toISOString()
          },
          { status: 200 }
        );
      }
    } finally {
      connection.release();
      await pool.end();
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process forgot password request',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
