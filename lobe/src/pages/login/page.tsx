import { memo, useState } from 'react';
import { message, Input, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, GithubOutlined } from '@ant-design/icons';
import { Avatar, LogoProps, useControls, useCreateStore } from '@lobehub/ui';
import styled from 'styled-components';
import { login } from '../../services/AuthorizeService';
import { InitSetting, SystemSetting } from '../../services/SettingService';
import { useNavigate } from 'react-router-dom';

const FunctionTools = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    cursor: pointer;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: 0 auto;
    width: 380px;
    margin-top: 20px;
    color: #0366d6;
`;

const Login = memo(() => {
    const params = new URLSearchParams(location.search);

    const redirect_uri = params.get('redirect_uri');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const store = useCreateStore();
    const control: LogoProps | any = useControls(
        {
            size: {
                max: 240,
                min: 16,
                step: 4,
                value: 64,
            },
            type: {
                options: ['3d', 'flat', 'high-contrast', 'text', 'combine'],
                value: '3d',
            },
        },
        { store },
    );



    function handleGithub() {

        const clientId = InitSetting.find(s => s.key === SystemSetting.GithubClientId)?.value;

        if (!clientId) {
            message.error({
                content: '请联系管理员配置 Github ClientId',
            });
            return;
        }

        // 跳转 Github 授权页面
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${location.origin}/auth&response_type=code`;
    }


    return (
        <>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: '0 auto',
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                textAlign: 'center',

            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto', width: '380px', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '50%' }}>
                        <Avatar src='/logo.png' {...control} />
                        <h2>
                            登录账号
                        </h2>
                    </div>
                    <div style={{ marginBottom: '20px', width: '100%' }}>
                        <Input
                            value={user}
                            onChange={(e) => setUser(e.target.value)}
                            size='large'
                            placeholder="请输入账号" />
                    </div>
                    <div style={{ width: '100%' }}></div>
                    <Input.Password
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        size='large'
                        placeholder="请输入密码"
                        iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                </div>
                <div style={{
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '380px',
                    marginTop: '20px',
                }}>
                    <Button
                        loading={loading}
                        onClick={async () => {
                            try {
                                setLoading(true);
                                const token = await login({
                                    account: user,
                                    pass: password,
                                });

                                if (token.success) {
                                    localStorage.setItem('token', token.data.token);
                                    localStorage.setItem('role', token.data.role);
                                    message.success({
                                        title: '登录成功',
                                        content: '即将跳转到首页'
                                    } as any);

                                    if (redirect_uri && redirect_uri.startsWith('http')) {
                                        const url = new URL(redirect_uri);
                                        url.searchParams.append('token', token.data.token);
                                        window.location.href = url.toString();
                                        return;
                                    }

                                    setTimeout(() => {
                                        navigate('/panel');
                                    }, 1000);
                                } else {
                                    message.error({
                                        title: '登录失败',
                                        content: token.message
                                    } as any);
                                    setLoading(false);
                                }

                            } catch (e) {

                            }
                            setLoading(false);

                        }}
                        size='large'
                        type="primary"
                        block >
                        登录
                    </Button>
                </div>
                <FunctionTools>
                    <span onClick={() => {
                        if (typeof window === 'undefined') return;
                        window.location.href = '/register';
                    }}>
                        注册账号
                    </span>
                </FunctionTools>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto', width: '380px', paddingBottom: '8px', paddingTop: '20px' }}>
                    <Button onClick={() => { handleGithub() }} size='large' type='text' icon={<GithubOutlined />} />
                </div>
            </div>
        </>
    );
});

export default Login;