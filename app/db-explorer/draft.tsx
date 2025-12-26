{/* <Card className="lg:col-span-3 h-fit">
            <CardHeader>
              <CardTitle>PostgreSQL Config</CardTitle>
              <CardDescription>Database connection settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    value={dbData.host}
                    onChange={(e) => setDbData({ ...dbData, host: e.target.value })}
                    placeholder="localhost"
                    required
                    disabled={dbConfigured}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      value={dbData.port}
                      onChange={(e) => setDbData({ ...dbData, port: e.target.value })}
                      required
                      disabled={dbConfigured}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={dbData.username}
                      onChange={(e) => setDbData({ ...dbData, username: e.target.value })}
                      required
                      disabled={dbConfigured}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={dbData.password}
                    onChange={(e) => setDbData({ ...dbData, password: e.target.value })}
                    required
                    disabled={dbConfigured}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database">Database</Label>
                  <Input
                    id="database"
                    value={dbData.database}
                    onChange={(e) => setDbData({ ...dbData, database: e.target.value })}
                    required
                    disabled={dbConfigured}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tableName">Config Table</Label>
                  <Input
                    id="tableName"
                    value={dbData.tableName}
                    onChange={(e) => setDbData({ ...dbData, tableName: e.target.value })}
                    required
                    disabled={dbConfigured}
                  />
                </div>
                {!dbConfigured ? (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => setDbConfigured((prev) => prev = true)}
                  >
                    Configure Database
                    
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => setDbConfigured((prev) => prev = false)}
                  >
                    Edit Connection
                  </Button>
                )}
              </form>
            </CardContent>
          </Card> */}